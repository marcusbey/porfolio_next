import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export const Contact = () => {
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState<string | null>("");
  const [error, setError] = useState<string | null>("");
  const [loading, setLoading] = useState<Boolean>(false);

  const [formState, setFormState] = useState({
    email: {
      value: "",
      error: "",
    },
    message: {
      value: "",
      error: "",
    },
  });

  const dropIn = {
    hidden: {
      y: "4vh",
      opacity: 0,
    },
    visible: {
      y: "0",
      opacity: 1,
      transition: {
        duration: 0.2,
        type: "stiff",
        damping: 25,
      },
    },
    exit: {
      y: "4vh",
      opacity: 0,
    },
  };

  const onChangeHandler = (field: any, value: any) => {
    let state = {
      [field]: {
        value,
        error: null,
      },
    };
    setFormState({ ...formState, ...state });
  };

  const handleSubmit = async () => {
    let { email, message } = formState;
    let updatedState = { ...formState };
    let regex =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    
    if (!email.value) {
      updatedState.email.error = `Oops! Email cannot be empty.`;
      setFormState({ ...updatedState });
      return;
    }

    if (!email.value.toLowerCase().match(regex)) {
      updatedState.email.error = `Please enter a valid email address`;
      setFormState({ ...updatedState });
      return;
    }
    
    if (!message.value) {
      updatedState.message.error = `Oops! Message cannot be empty.`;
      setFormState({ ...updatedState });
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const baseUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3000' 
        : process.env.NEXT_PUBLIC_SITE_URL || '';
        
      const response = await fetch(`${baseUrl}/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.value,
          message: message.value,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
      }

      const data = await response.json();
      setSuccess('Message sent successfully! I\'ll get back to you soon. 🚀');
      setFormState({
        email: { value: '', error: '' },
        message: { value: '', error: '' },
      });
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to send message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = () => {
    setOpen(!open);
    setFormState({
      email: {
        value: "",
        error: "",
      },
      message: {
        value: "",
        error: "",
      },
    });
    setLoading(false);
    setError("");
    setSuccess("");
  };

  return (
    <AnimatePresence initial={false} onExitComplete={() => null}>
      <div className="fixed right-4 md:right-10 bottom-10 flex flex-col items-end z-[99999]">
        {open && (
          <motion.div
            variants={dropIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="mb-4 rounded-xl shadow-2xl bg-zinc-800   flex flex-col overflow-hidden mx-4 md:mx-0"
          >
            <div className="p-4 bg-zinc-700 ">
              <h2 className="text-zinc-200 font-bold text-sm md:text-xl ">
                Have a question? Drop in your message 👇
              </h2>
              <small className="hidden md:block text-xs text-zinc-400 mb-10 ">
                It won't take more than 10 seconds. Shoot your shot. 😉
              </small>
            </div>
            <div className="content p-6 flex flex-col bg-zinc-800">
              <label className="text-sm font-normal text-zinc-400 mb-2 ">
                Email Address
              </label>
              <input
                type="email"
                value={formState.email.value}
                onChange={(e) => onChangeHandler("email", e.target.value)}
                className="text-zinc-400 rounded-md border bg-zinc-800 border-zinc-700 py-1 px-2 focus:outline-none focus:border-gray-400 placeholder:text-sm  mb-1"
                placeholder="johndoe@xyz.com"
              />

              <small className="h-4 min-h-4 text-red-500 font-semibold">
                {formState.email.error && formState.email.error}
              </small>

              <label className="text-sm font-normal text-zinc-400 mb-2 ">
                Message
              </label>
              <textarea
                rows={3}
                value={formState.message.value}
                onChange={(e) => onChangeHandler("message", e.target.value)}
                className="text-zinc-400 rounded-md border border-zinc-700 py-1 px-2 bg-zinc-800 focus:outline-none focus:border-gray-400 placeholder:text-sm   mb-1"
                placeholder="I'd love a compliment from you."
              />
              <small className="h-4 min-h-4 text-red-500 font-semibold mb-4">
                {formState.message.error && formState.message.error}
              </small>
              <button
                onClick={handleSubmit}
                className="text-zinc-100  w-full px-4 py-2 md:py-4 border-2 border-zinc-800 bg-zinc-700 rounded-md font-normal text-sm  mb-4 transition duration-200 hover:shadow-none"
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
              <small className="h-4 min-h-4 mb-4">
                {success && (
                  <p className="text-green-500 font-semibold text-sm">
                    {success}
                  </p>
                )}
                {error && (
                  <p className="text-red-500 font-semibold text-sm">{error}</p>
                )}
              </small>
            </div>
          </motion.div>
        )}
        <button
          onClick={handleButtonClick}
          className="bg-zinc-700  w-14 h-14 rounded-full  flex items-center justify-center hover:scale-105 hover:shadow-xl transition duration-200 shadow-lg"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6 text-zinc-100"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.157 2.148.279 3.238.364.466.037.893.281 1.153.671L12 21l2.652-3.978c.26-.39.687-.634 1.153-.67 1.09-.086 2.17-.208 3.238-.365 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
            />
          </svg>
        </button>
      </div>
    </AnimatePresence>
  );
};
