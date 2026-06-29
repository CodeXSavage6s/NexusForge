import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldValues } from "react-hook-form";
import { FormInputProps } from "@/types/global";

const InputField = <T extends FieldValues>({
  name,
  label,
  placeholder,
  register,
  validation,
  type = "text",
  disabled,
  value,
  error,
}: FormInputProps) => {
  return (
    <div>
      <Label htmlFor={name} className="mb-2">{label}</Label>
      <Input
        id={name}
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        {...register(name, validation)}
        className="p-2 h-[45px]"
      />
      {error && (
        <p className="text-sm text-red-500 mt-1">{error.message}</p>
      )}
    </div>
  );
};

export default InputField;
