import { useRef } from "react";

import { useConsoleParams } from "@/routing";
import { ActionIcon, Paper } from "@/ui/core";
import { Icons } from "@/ui/icons";
import { modals } from "@/ui/modals";
import { notifications } from "@/ui/notifications";
import { usePachaLocalChatClient } from "../data/hooks";
import { PachaFeedbackForm } from "./PachFeedbackForm";

const PachaFeedback = () => {
  const { threadId } = useConsoleParams();

  const localChatClient = usePachaLocalChatClient();

  const isClosing = useRef(false);

  const sendFeedback = (feedback_enum: number, feedbackText?: string) => {
    if (threadId === undefined) return;

    const feedbackType = feedback_enum === 1 ? "positive" : "negative";

    localChatClient
      .submitFeedback({
        threadId,
        mode: "no_data",
        feedbackEnum: feedback_enum,
        feedbackText,
      })
      .then(() => {
        let title, message;

        if (feedbackType === "positive") {
          title = "Thanks for the thumbs up!";
          message =
            "We're glad you found this helpful. Your positive feedback helps us improve.";
        } else {
          title = "Thanks for your feedback";
          message =
            "We appreciate your input. We'll use this to make improvements.";
        }

        if (feedbackText) {
          message += " Your additional comments have been recorded.";
        }
        notifications.show({
          type: "success",
          title: title,
          message: message,
        });
      })
      .catch((_) => {
        notifications.show({
          type: "error",
          title: "Oops! Something went wrong",
          message: "We couldn't submit your feedback. Please try again later.",
        });
      });
  };

  const handlePachaFeedback = (feedback_enum: number) => {
    isClosing.current = false;

    modals.open({
      id: "pacha-feedback",
      title: "Feedback",
      children: (
        <PachaFeedbackForm
          onSubmit={(values) => {
            isClosing.current = true;
            sendFeedback(feedback_enum, values?.feedback || undefined);
          }}
        />
      ),
      onClose: () => {
        if (!isClosing.current) {
          isClosing.current = true;
          sendFeedback(feedback_enum);
        }
      },
    });
  };

  if (!threadId) return null;

  return (
    <Paper
      style={{
        whiteSpace: "pre-wrap",
        alignSelf: "flex-end",
      }}
      maw={100}
      p={"xs"}
      withBorder
      radius={"lg"}
    >
      <ActionIcon variant="subtle" onClick={() => handlePachaFeedback(1)}>
        <Icons.LikeMessage />
      </ActionIcon>
      <ActionIcon variant="subtle" onClick={() => handlePachaFeedback(-1)}>
        <Icons.DislikeMessage />
      </ActionIcon>
    </Paper>
  );
};
export default PachaFeedback;
