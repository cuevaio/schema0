import { motion } from "framer-motion";
import { FullscreenIcon, MinimizeIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

export const FullScreenButton = ({
  isFullScreen,
  onClick,
}: {
  isFullScreen: boolean;
  onClick: () => void;
}) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn("absolute z-10", {
        "top-2 right-2": !isFullScreen,
        "top-20 right-3": isFullScreen,
      })}
    >
      <motion.div
        initial={{ scale: 1 }}
        animate={{ scale: isFullScreen ? 1.2 : 1 }}
        transition={{ duration: 0.2 }}
      >
        {isFullScreen ? (
          <MinimizeIcon className="size-4" />
        ) : (
          <FullscreenIcon className="size-4" />
        )}
      </motion.div>
    </Button>
  );
};
