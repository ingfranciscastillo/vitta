import { CalendarMinimalisticIcon } from "@solar-icons/react/linear/calendar-minimalistic";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import { Calendar } from "#/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "#/components/ui/popover";
import { cn } from "#/lib/utils";

type DatePickerProps = {
	value?: string;
	onChange: (date: string | undefined) => void;
	placeholder?: string;
	disabled?: boolean;
	className?: string;
	id?: string;
	captionLayout?: "dropdown" | "dropdown-months" | "dropdown-years" | "label";
};

export function DatePicker({
	value,
	onChange,
	placeholder = "Seleccionar fecha",
	disabled,
	className,
	id,
	captionLayout,
}: DatePickerProps) {
	const [open, setOpen] = useState<boolean>(false);
	const date = value ? new Date(`${value}T00:00:00`) : undefined;
	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					id={id}
					type="button"
					variant="outline"
					disabled={disabled}
					className={cn(
						"w-full justify-start text-left font-normal h-11 px-3 bg-transparent border-input",
						!date && "text-muted-foreground",
						className,
					)}
				>
					<CalendarMinimalisticIcon className="mr-2 size-4 shrink-0" />
					<span className="truncate">
						{date ? format(date, "PPP", { locale: es }) : placeholder}
					</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				<Calendar
					mode="single"
					selected={date}
					onSelect={(d) => {
						onChange(d ? format(d, "yyyy-MM-dd") : undefined);
						setOpen(false);
					}}
					locale={es}
					captionLayout={captionLayout}
				/>
			</PopoverContent>
		</Popover>
	);
}

export default DatePicker;
