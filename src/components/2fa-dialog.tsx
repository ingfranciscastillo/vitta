import {
  KeyIcon,
  LetterIcon,
  SmartphoneIcon,
} from "@solar-icons/react/linear";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Bars } from "#/components/bars";
import { Button } from "#/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import { Field } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "#/components/ui/input-otp";
import { Label } from "#/components/ui/label";
import { Switch } from "#/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { authClient } from "#/lib/auth-client";
import { mapAuthError } from "#/lib/auth-errors";

export type TwoFactorMethod = "totp" | "otp" | "backup";

type TwoFactorDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  methods: TwoFactorMethod[];
  onVerified: () => void | Promise<void>;
};

export function TwoFactorDialog({
  open,
  onOpenChange,
  email,
  methods,
  onVerified,
}: TwoFactorDialogProps) {
  const available: TwoFactorMethod[] =
    methods.length > 0 ? methods : ["totp", "otp", "backup"];
  const initialMethod: TwoFactorMethod = available.includes("totp")
    ? "totp"
    : (available[0] ?? "totp");

  const [method, setMethod] = useState<TwoFactorMethod>(initialMethod);
  const [code, setCode] = useState("");
  const [backupCode, setBackupCode] = useState("");
  const [trustDevice, setTrustDevice] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (!open) {
      setMethod(initialMethod);
      setCode("");
      setBackupCode("");
      setTrustDevice(false);
      setOtpSent(false);
      setError(null);
      setSubmitting(false);
      setSendingOtp(false);
      setResendCooldown(0);
    }
  }, [open, initialMethod]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setInterval(() => {
      setResendCooldown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [resendCooldown]);

  const resetForm = (next?: TwoFactorMethod) => {
    setError(null);
    setCode("");
    setBackupCode("");
    if (next === "otp") setOtpSent(false);
  };

  const handleMethodChange = (next: string) => {
    setMethod(next as TwoFactorMethod);
    resetForm(next as TwoFactorMethod);
  };

  const handleSendOtp = async () => {
    setSendingOtp(true);
    setError(null);
    const { error: err } = await authClient.twoFactor.sendOtp();
    setSendingOtp(false);
    if (err) {
      setError(mapAuthError(err));
      return;
    }
    setOtpSent(true);
    setResendCooldown(30);
    toast.success("Código enviado a tu email");
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    let res: { error: unknown };
    if (method === "totp") {
      res = await authClient.twoFactor.verifyTotp({ code, trustDevice });
    } else if (method === "otp") {
      res = await authClient.twoFactor.verifyOtp({ code, trustDevice });
    } else {
      res = await authClient.twoFactor.verifyBackupCode({
        code: backupCode,
        trustDevice,
      });
    }
    setSubmitting(false);
    if (res.error) {
      setError(mapAuthError(res.error));
      return;
    }
    toast.success("Verificación completada");
    await onVerified();
  };

  const handleCancel = () => {
    if (submitting || sendingOtp) return;
    onOpenChange(false);
  };

  const canSubmit =
    method === "backup"
      ? backupCode.length >= 8 && backupCode.length <= 12 && !submitting
      : code.length === 6 && !submitting;

  const showTotp = available.includes("totp");
  const showOtp = available.includes("otp");
  const showBackup = available.includes("backup");
  const tabCount = [showTotp, showOtp, showBackup].filter(Boolean).length;
  const gridCols =
    tabCount === 3
      ? "grid-cols-3"
      : tabCount === 2
        ? "grid-cols-2"
        : "grid-cols-1";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && (submitting || sendingOtp)) return;
        onOpenChange(next);
      }}
    >
      <DialogContent
        className="max-w-sm"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => {
          if (submitting || sendingOtp) e.preventDefault();
        }}
      >
        <DialogHeader className="gap-3">
          <BrandMark />
          <DialogTitle className="font-display text-2xl text-balance leading-none">
            Doble check
          </DialogTitle>
          <DialogDescription className="text-pretty flex flex-wrap items-center gap-x-1.5 gap-y-1">
            <span>Confirma que eres tú en</span>
            <span className="font-mono text-[11px] text-foreground bg-muted px-1.5 py-0.5 rounded break-all">
              {email}
            </span>
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div
            role="alert"
            className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
          >
            {error}
          </div>
        )}

        {tabCount < 2 ? (
          <SingleMethodPanel
            method={initialMethod}
            otpSent={otpSent}
            sendingOtp={sendingOtp}
            resendCooldown={resendCooldown}
            code={code}
            setCode={setCode}
            backupCode={backupCode}
            setBackupCode={setBackupCode}
            submitting={submitting}
            onSendOtp={handleSendOtp}
          />
        ) : (
          <Tabs value={method} onValueChange={handleMethodChange}>
            <TabsList
              className={`grid w-full ${gridCols} bg-transparent p-0 gap-2 h-auto`}
            >
              {showTotp && (
                <TabsTrigger
                  value="totp"
                  className="rounded-xl border border-border bg-background h-10 gap-1.5 px-2 data-[state=active]:bg-secondary data-[state=active]:border-secondary data-[state=active]:shadow-none"
                >
                  <SmartphoneIcon className="size-4" aria-hidden="true" />
                  App
                </TabsTrigger>
              )}
              {showOtp && (
                <TabsTrigger
                  value="otp"
                  className="rounded-xl border border-border bg-background h-10 gap-1.5 px-2 data-[state=active]:bg-secondary data-[state=active]:border-secondary data-[state=active]:shadow-none"
                >
                  <LetterIcon className="size-4" aria-hidden="true" />
                  Email
                </TabsTrigger>
              )}
              {showBackup && (
                <TabsTrigger
                  value="backup"
                  className="rounded-xl border border-border bg-background h-10 gap-1.5 px-2 data-[state=active]:bg-secondary data-[state=active]:border-secondary data-[state=active]:shadow-none"
                >
                  <KeyIcon className="size-4" aria-hidden="true" />
                  Respaldo
                </TabsTrigger>
              )}
            </TabsList>

            {showTotp && (
              <TabsContent value="totp" className="flex flex-col gap-2 pt-4">
                <TotpInput
                  value={code}
                  onChange={setCode}
                  disabled={submitting}
                />
                {showOtp && (
                  <button
                    type="button"
                    onClick={() => handleMethodChange("otp")}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors self-center"
                  >
                    ¿No funciona? Usa email en su lugar →
                  </button>
                )}
                {showBackup && !showOtp && (
                  <button
                    type="button"
                    onClick={() => handleMethodChange("backup")}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors self-center"
                  >
                    ¿No funciona? Usa un código de respaldo →
                  </button>
                )}
              </TabsContent>
            )}

            {showOtp && (
              <TabsContent value="otp" className="flex flex-col gap-3 pt-4">
                <OtpPanel
                  sent={otpSent}
                  sending={sendingOtp}
                  cooldown={resendCooldown}
                  code={code}
                  setCode={setCode}
                  disabled={submitting}
                  onSend={handleSendOtp}
                  onFallback={null}
                />
              </TabsContent>
            )}

            {showBackup && (
              <TabsContent value="backup" className="flex flex-col gap-3 pt-4">
                <BackupInput
                  value={backupCode}
                  onChange={setBackupCode}
                  disabled={submitting}
                />
              </TabsContent>
            )}
          </Tabs>
        )}

        <label
          htmlFor="2fa-trust-device"
          className="flex items-center justify-between gap-3 cursor-pointer rounded-xl border border-border bg-background p-3"
        >
          <div className="flex flex-col gap-0.5">
            <span className="font-display text-[11px] uppercase tracking-wide">
              Confiar en este dispositivo?
            </span>
            <span className="text-xs text-muted-foreground">
              Sin 2FA durante 30 días en este navegador.
            </span>
          </div>
          <Switch
            id="2fa-trust-device"
            checked={trustDevice}
            onCheckedChange={(v) => setTrustDevice(v === true)}
            disabled={submitting}
          />
        </label>

        <DialogFooter className="gap-2">
          <Button size="cta"
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={submitting || sendingOtp}
            
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={!canSubmit}
            aria-busy={submitting}
            className="h-11 flex-1 font-display"
          >
            {submitting && <Bars className="size-3 mr-1.5" />}
            {submitting ? "Verificando..." : "Verificar"}
          </Button>
        </DialogFooter>

        <p className="text-center text-[10px] text-muted-foreground/70 -mt-1">
          Protegido por verificación en dos pasos
        </p>
      </DialogContent>
    </Dialog>
  );
}

function SingleMethodPanel(props: {
  method: TwoFactorMethod;
  otpSent: boolean;
  sendingOtp: boolean;
  resendCooldown: number;
  code: string;
  setCode: (v: string) => void;
  backupCode: string;
  setBackupCode: (v: string) => void;
  submitting: boolean;
  onSendOtp: () => void | Promise<void>;
}) {
  const {
    method,
    otpSent,
    sendingOtp,
    resendCooldown,
    code,
    setCode,
    backupCode,
    setBackupCode,
    submitting,
    onSendOtp,
  } = props;
  if (method === "totp") {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          Abre tu app authenticator e introduce el código de 6 dígitos.
        </p>
        <TotpInput value={code} onChange={setCode} disabled={submitting} />
      </div>
    );
  }
  if (method === "otp") {
    return (
      <OtpPanel
        sent={otpSent}
        sending={sendingOtp}
        cooldown={resendCooldown}
        code={code}
        setCode={setCode}
        disabled={submitting}
        onSend={onSendOtp}
        onFallback={null}
      />
    );
  }
  return (
    <BackupInput
      value={backupCode}
      onChange={setBackupCode}
      disabled={submitting}
    />
  );
}

function TotpInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <Field>
      <Label htmlFor="2fa-totp" className="sr-only">
        Código de authenticator
      </Label>
      <InputOTP
        id="2fa-totp"
        maxLength={6}
        value={value}
        onChange={onChange}
        disabled={disabled}
        containerClassName="justify-center"
      >
        <InputOTPGroup className="gap-2">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <InputOTPSlot
              key={i}
              index={i}
              className="size-12 rounded-xl border-2 font-display text-xl data-[active=true]:border-primary data-[active=true]:ring-primary/30"
            />
          ))}
        </InputOTPGroup>
      </InputOTP>
    </Field>
  );
}

function OtpPanel({
  sent,
  sending,
  cooldown,
  code,
  setCode,
  disabled,
  onSend,
  onFallback,
}: {
  sent: boolean;
  sending: boolean;
  cooldown: number;
  code: string;
  setCode: (v: string) => void;
  disabled?: boolean;
  onSend: () => void | Promise<void>;
  onFallback: (() => void) | null;
}) {
  if (!sent) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          Te enviaremos un código de 6 dígitos a tu email.
        </p>
        <Button
          type="button"
          onClick={() => void onSend()}
          disabled={sending}
          aria-busy={sending}
          size="cta"
          className="w-full"
        >
          {sending && <Bars className="size-3 mr-1.5" />}
          {sending ? "Enviando..." : "Enviar código a mi email"}
        </Button>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        Introduce el código de 6 dígitos que te hemos enviado.
      </p>
      <TotpInput value={code} onChange={setCode} disabled={disabled} />
      <div className="flex items-center justify-center gap-3 text-xs">
        <button
          type="button"
          onClick={() => void onSend()}
          disabled={cooldown > 0 || sending}
          className="text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
        >
          {cooldown > 0
            ? `Reenviar en ${cooldown}s`
            : sending
              ? "Enviando..."
              : "Reenviar código"}
        </button>
        {onFallback && (
          <>
            <span className="text-muted-foreground/50">·</span>
            <button
              type="button"
              onClick={onFallback}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              ¿No llegó? Usa respaldo →
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function BrandMark() {
  return (
    <div className="flex items-center gap-2">
      <span className="size-2.5 rounded-full bg-primary" />
      <span className="font-display text-base">Vitta</span>
    </div>
  );
}

function BackupInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <Field>
      <Label htmlFor="2fa-backup">Código de respaldo</Label>
      <div className="relative">
        <LetterIcon
          className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id="2fa-backup"
          type="text"
          inputMode="text"
          autoComplete="one-time-code"
          placeholder="xxxxxxxxxx"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10 font-mono tracking-widest uppercase"
          maxLength={12}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Introduce uno de los códigos de respaldo que guardaste al activar 2FA.
      </p>
    </Field>
  );
}
