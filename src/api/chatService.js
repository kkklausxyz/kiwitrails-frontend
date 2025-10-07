/**
 * Chat API Service
 * Handle communication with backend chat API
 * Using DeepSeek model, unified call to /chatMessage endpoint
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Generic fetch request function
const fetchApi = async (
  url,
  method = "POST",
  body = null,
  resType = "json",
  reqType = "json",
  onStream = null,
  signal = null
) => {
  const headers = {
    ...(reqType === "json" && { "Content-Type": "application/json" }),
  };

  let bodyData = null;
  if (reqType === "json") {
    bodyData = JSON.stringify(body);
  } else if (method === "GET") {
    bodyData = null;
  } else {
    bodyData = body;
  }

  const options = {
    method,
    headers,
    body: bodyData,
    signal, // Add AbortSignal support
  };

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const status = response.status;
      let errorMessage = "Request failed";
      let errorData = null;

      // Try to parse error response
      try {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          errorData = await response.json();
        } else {
          errorData = { msg: await response.text() };
        }
      } catch (parseError) {
        console.warn("Unable to parse error response:", parseError);
        errorData = { msg: "Response format error" };
      }

      switch (status) {
        case 404:
          errorMessage = "Interface not found (404)";
          break;
        case 500:
        case 501:
        case 502:
          errorMessage = "Internal server error";
          break;
        case 400:
          errorMessage = "Request parameter error";
          break;
        case 422:
          errorMessage = errorData?.msg || "Parameter validation failed";
          break;
        default:
          errorMessage = errorData?.msg || `HTTP error ${status}`;
      }

      throw new Error(errorMessage);
    }

    // Non-streaming output
    if (response.ok && resType !== "stream") {
      try {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const result = await response.json();
          return result;
        } else {
          // If not JSON, return text content
          const textResult = await response.text();
          return {
            data: textResult,
            msg: "Text response",
            error: null,
            serviceCode: 0,
            code: 200,
          };
        }
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
        throw new Error("Response format error, unable to parse JSON");
      }
    }

    // Streaming output processing
    if (response.ok && resType === "stream") {
      const reader = response.body?.getReader();
      let fullResponse = "";
      let buffer = ""; // Buffer for handling incomplete data

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const decoder = new TextDecoder("utf-8");
        const decodedString = decoder.decode(value);

        // Add new data to buffer
        buffer += decodedString;

        if (decodedString !== "OK") {
          // Parse streaming data - handle concatenated JSON objects
          try {
            // Try to split concatenated JSON objects
            const jsonObjects = [];
            let currentPos = 0;
            let braceCount = 0;
            let startPos = 0;

            for (let i = 0; i < buffer.length; i++) {
              if (buffer[i] === "{") {
                if (braceCount === 0) {
                  startPos = i;
                }
                braceCount++;
              } else if (buffer[i] === "}") {
                braceCount--;
                if (braceCount === 0) {
                  // Found a complete JSON object
                  const jsonStr = buffer.slice(startPos, i + 1);
                  jsonObjects.push(jsonStr);
                }
              }
            }

            // Parse each JSON object
            for (const jsonStr of jsonObjects) {
              try {
                const res = JSON.parse(jsonStr);

                // Extract content based on actual data structure
                let content = "";
                if (res.data) {
                  content = res.data;
                  fullResponse += res.data;
                } else if (res.content) {
                  content = res.content;
                  fullResponse += res.content;
                }

                // If there's a streaming callback function, call it in real-time
                if (onStream && content) {
                  onStream(content);
                }
              } catch (e) {
                console.warn(
                  "Failed to parse JSON object:",
                  e,
                  "Data:",
                  jsonStr
                );
              }
            }

            // Clean up processed data, keep unprocessed parts
            const lastCompleteIndex = buffer.lastIndexOf("}");
            if (lastCompleteIndex !== -1) {
              buffer = buffer.slice(lastCompleteIndex + 1);
            }
          } catch (e) {
            console.warn(
              "Failed to parse streaming data:",
              e,
              "Original data:",
              decodedString
            );
          }
        }

        if (decodedString === "OK") {
          break;
        }
      }

      return {
        data: fullResponse,
        msg: "Streaming response completed",
        error: null,
        serviceCode: 0,
        code: 200,
      };
    }
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
};

/**
 * Send chat message (supports streaming callback)
 * @param {Array} conversation - Conversation history array, format: [{role: "user", content: "message"}, {role: "assistant", content: "reply"}]
 * @param {Function} onStream - Streaming data callback function, parameter is received content
 * @param {AbortSignal} signal - Cancel signal
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export const sendChatMessage = async (
  conversation,
  onStream = null,
  signal = null
) => {
  try {
    // Check conversation parameter
    if (!conversation || !Array.isArray(conversation)) {
      console.error("❌ Invalid conversation history parameter:", conversation);
      throw new Error("Conversation history parameter must be an array");
    }

    const data = {
      chatMessage: conversation,
    };

    const result = await fetchApi(
      `${API_BASE_URL}/chatMessage`,
      "POST",
      data,
      "stream",
      "json",
      onStream,
      signal
    );

    // Safely extract reply content
    let reply = "Sorry, I cannot understand your question.";
    if (result && typeof result === "object") {
      reply = result.data || result.content || result.message || reply;
    }

    return {
      success: true,
      data: {
        reply: reply,
        originalData: result,
      },
    };
  } catch (error) {
    console.error("Failed to send message:", error);

    // Check if user actively cancelled
    if (error.name === "AbortError" || error.message.includes("aborted")) {
      return {
        success: false,
        error: "User actively cancelled",
        aborted: true, // Mark as actively cancelled
      };
    }

    return {
      success: false,
      error: error.message || "Network request failed",
    };
  }
};

/**
 * Test API connection
 * @returns {Promise<boolean>}
 */
export const testApiConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/chatMessage`, {
      method: "GET",
    });
    return response.ok;
  } catch (error) {
    console.error("API connection test failed:", error);
    return false;
  }
};

/**
 * Debug API endpoint
 * @param {string} endpoint - API endpoint
 * @returns {Promise<{success: boolean, details: any}>}
 */
export const debugApiEndpoint = async (endpoint) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "GET",
    });

    const contentType = response.headers.get("content-type");
    const status = response.status;

    let responseData;
    if (contentType && contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    return {
      success: response.ok,
      details: {
        status,
        contentType,
        data: responseData,
        url: `${API_BASE_URL}${endpoint}`,
      },
    };
  } catch (error) {
    console.error("Failed to debug API endpoint:", error);
    return {
      success: false,
      details: {
        error: error.message,
        url: `${API_BASE_URL}${endpoint}`,
      },
    };
  }
};
