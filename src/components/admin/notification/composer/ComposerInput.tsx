
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EmojiPickerButton } from "./EmojiPicker";

type InputId = 'title_en' | 'title_ar' | 'body_en' | 'body_ar';

interface ComposerInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  inputId: InputId;
  isTextArea?: boolean;
  isRtl?: boolean;
  onEmojiSelect: (emoji: any) => void;
  onEmojiPickerOpen: (inputId: InputId) => void;
}

export const ComposerInput = ({
  label,
  value,
  onChange,
  placeholder,
  inputId,
  isTextArea = false,
  isRtl = false,
  onEmojiSelect,
  onEmojiPickerOpen
}: ComposerInputProps) => (
  <div className="space-y-2">
    <label className="text-sm font-medium">{label}</label>
    <div className="flex gap-2">
      {isTextArea ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={isRtl ? "text-right" : ""}
          dir={isRtl ? "rtl" : "ltr"}
          rows={4}
        />
      ) : (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={isRtl ? "text-right" : ""}
          dir={isRtl ? "rtl" : "ltr"}
        />
      )}
      <EmojiPickerButton
        inputId={inputId}
        onEmojiSelect={onEmojiSelect}
        onOpen={onEmojiPickerOpen}
      />
    </div>
  </div>
);
