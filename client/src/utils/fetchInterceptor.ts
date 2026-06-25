import { toast } from "react-hot-toast";

const originalFetch = window.fetch;

window.fetch = async function (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const maxRetries = 3;
  let attempt = 0;
  let delay = 1000;

  while (attempt <= maxRetries) {
    let requestToFetch: RequestInfo | URL = input;

    // If the input is a Request instance, we need to clone it
    // because its body can only be read once per fetch call.
    if (input instanceof Request) {
      requestToFetch = input.clone();
    }

    try {
      const response = await originalFetch(requestToFetch, init);

      if (response.status === 429) {
        attempt++;
        if (attempt > maxRetries) {
          toast.error("Too many requests. Please try again later.", { id: "rate-limit-fail" });
          return response;
        }

        // Retrieve the Retry-After header (in seconds)
        const retryAfterHeader = response.headers.get("Retry-After");
        let waitTime = delay;
        if (retryAfterHeader) {
          const parsedSecs = parseInt(retryAfterHeader, 10);
          if (!isNaN(parsedSecs)) {
            waitTime = parsedSecs * 1000;
          }
        } else {
          // Exponential backoff with jitter
          waitTime = delay * Math.pow(2, attempt - 1) + Math.random() * 500;
        }

        const waitSeconds = Math.ceil(waitTime / 1000);
        toast.error(
          `Too many requests. Retrying in ${waitSeconds} second${waitSeconds > 1 ? "s" : ""}...`,
          {
            id: "rate-limit-retry", // Keep single notification instance
            duration: waitTime,
          }
        );

        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }

      return response;
    } catch (error) {
      attempt++;
      if (attempt > maxRetries) {
        throw error;
      }
      // Simple backoff retry for network errors
      await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
    }
  }

  throw new Error("Max retries exceeded");
};
