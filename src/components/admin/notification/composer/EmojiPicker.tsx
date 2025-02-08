
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SmilePlus } from "lucide-react";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface EmojiPickerButtonProps {
  onEmojiSelect: (emoji: any) => void;
  inputId: string;
  onOpen: (inputId: string) => void;
}

export const EmojiPickerButton = ({ onEmojiSelect, inputId, onOpen }: EmojiPickerButtonProps) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button 
        variant="ghost" 
        size="icon"
        className="h-8 w-8"
        onClick={() => onOpen(inputId)}
      >
        <SmilePlus className="h-4 w-4" />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-full p-0" align="start">
      <Picker 
        data={data} 
        onEmojiSelect={onEmojiSelect}
        theme="light"
      />
    </PopoverContent>
  </Popover>
);
