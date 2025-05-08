import type React from "react";

import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Github, Linkedin, Twitter } from "lucide-react";

interface ContactSectionProps {
  data: {
    email?: string;
    phone?: string;
    location?: string;
    github?: string;
    linkedin?: string;
    twitter?: string;
    [key: string]: string | undefined;
  };
}

export function ContactSection({ data }: ContactSectionProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      setStatus("success");
      setFormData({
        name: "",
        email: "",
        message: "",
      });
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to send message"
      );
    }
  };

  const contactItems = [
    { icon: Mail, label: "Email", value: data.email },
    { icon: Phone, label: "Phone", value: data.phone },
    { icon: MapPin, label: "Location", value: data.location },
    { icon: Github, label: "GitHub", value: data.github },
    { icon: Linkedin, label: "LinkedIn", value: data.linkedin },
    { icon: Twitter, label: "Twitter", value: data.twitter },
  ].filter((item) => item.value);

  return (
    <section className="py-24 bg-black">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500">
            Get In Touch
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-cyan-500 mx-auto"></div>
        </motion.div>

        {/* Indie Game UI Style Contact */}
        <div className="max-w-5xl mx-auto">
          {/* Game Console Frame */}
          <div className="bg-zinc-900 border-4 border-zinc-700 rounded-xl p-6 shadow-[0_0_15px_rgba(255,0,128,0.3)] relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-500 to-cyan-500"></div>
            <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-cyan-500 to-pink-500"></div>

            {/* Console Lights */}
            <div className="absolute top-4 right-4 flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
              <div
                className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse"
                style={{ animationDelay: "0.5s" }}
              ></div>
              <div
                className="w-3 h-3 rounded-full bg-green-500 animate-pulse"
                style={{ animationDelay: "1s" }}
              ></div>
            </div>

            {/* Game Screen */}
            <div className="bg-zinc-800 rounded-lg p-6 border-2 border-zinc-600 mb-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500 inline-block">
                  COMMUNICATION TERMINAL
                </h3>
                <div className="mt-2 text-xs text-zinc-500 uppercase tracking-widest">
                  System v1.0.4 // Ready for input
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Contact Info - Left Side */}
                <div className="space-y-4">
                  <div className="text-lg font-bold text-pink-400 mb-4 flex items-center">
                    <div className="w-2 h-6 bg-pink-500 mr-3"></div>
                    CONTACT DATA
                  </div>

                  {contactItems.map((item, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center gap-4 bg-zinc-900/50 p-3 rounded-md border border-zinc-700 hover:border-pink-500/50 transition-colors duration-300"
                      whileHover={{ x: 5 }}
                    >
                      <div className="w-10 h-10 flex items-center justify-center bg-zinc-800 rounded-md text-pink-400 border border-pink-500/30">
                        <item.icon className="h-5 w-5 min-w-[35px]" />
                      </div>
                      <div>
                        <div className="font-medium text-zinc-400 text-xs uppercase tracking-wider">
                          {item.label}
                        </div>
                        <a
                          href={
                            item.label.toLowerCase() === "email"
                              ? `mailto:${item.value}`
                              : item.label.toLowerCase() === "phone"
                                ? `tel:${item.value}`
                                : item.label.toLowerCase() === "location"
                                  ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                      item.value!
                                    )}`
                                  : item.value
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white hover:text-pink-400 transition-colors duration-300 break-words word-wrap break-all"
                        >
                          {item.value}
                        </a>
                      </div>
                    </motion.div>
                  ))}

                  <div className="mt-6 text-xs text-zinc-500 font-mono">
                    <span className="text-pink-500">&gt;</span> Connection
                    secure. Awaiting message...
                  </div>
                </div>

                {/* Message Form - Right Side */}
                <div className="bg-zinc-900/50 rounded-md border-2 border-zinc-700 p-4">
                  <div className="text-lg font-bold text-cyan-400 mb-4 flex items-center">
                    <div className="w-2 h-6 bg-cyan-500 mr-3"></div>
                    SEND MESSAGE
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="name"
                        className="text-zinc-400 text-xs uppercase tracking-wider"
                      >
                        Name <span className="text-pink-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="bg-zinc-800 border-zinc-700 focus:border-cyan-500 text-white pl-10"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="text-zinc-400 text-xs uppercase tracking-wider"
                      >
                        Email <span className="text-pink-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="bg-zinc-800 border-zinc-700 focus:border-cyan-500 text-white pl-10"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="message"
                        className="text-zinc-400 text-xs uppercase tracking-wider"
                      >
                        Message <span className="text-pink-500">*</span>
                      </Label>
                      <div className="relative">
                        <Textarea
                          id="message"
                          name="message"
                          rows={8}
                          value={formData.message}
                          onChange={handleChange}
                          required
                          className="bg-zinc-800 border-zinc-700 focus:border-cyan-500 text-white resize-none pl-10 pt-8"
                        />
                        <div className="absolute left-3 top-6 text-cyan-500">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                          </svg>
                        </div>
                        <div className="absolute top-2 left-10 right-2">
                          <div className="h-1 w-full bg-zinc-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-pink-500 to-cyan-500 transition-all duration-300"
                              style={{
                                width: formData.message
                                  ? `${Math.min(
                                      100,
                                      formData.message.length / 2
                                    )}%`
                                  : "0%",
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full mt-4 bg-gradient-to-r from-pink-600 to-cyan-600 hover:from-pink-700 hover:to-cyan-700 text-white py-3 rounded-md font-bold relative overflow-hidden group"
                      disabled={status === "loading"}
                    >
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-pink-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
                      <div className="absolute inset-0 w-3/4 h-full bg-gradient-to-r from-pink-600/50 to-transparent animate-[shimmer_2s_infinite] z-0"></div>
                      <span className="relative z-10 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="22" y1="2" x2="11" y2="13"></line>
                          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                        {status === "loading"
                          ? "TRANSMITTING..."
                          : "TRANSMIT MESSAGE"}
                      </span>
                    </motion.button>

                    {/* Status Messages */}
                    {status !== "idle" && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-3 rounded-md font-mono text-sm flex items-center gap-2"
                      >
                        {status === "loading" && (
                          <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 w-full">
                            <div className="flex items-center p-2">
                              <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></span>
                              Transmitting message... Please wait
                            </div>
                          </div>
                        )}
                        {status === "success" && (
                          <div className="bg-green-500/10 border border-green-500/30 text-green-500 w-full">
                            <div className="flex items-center p-2">
                              <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                              Message transmitted successfully! Thank you for
                              reaching out.
                            </div>
                          </div>
                        )}
                        {status === "error" && (
                          <div className="bg-red-500/10 border border-red-500/30 text-red-500 w-full">
                            <div className="flex items-center p-2">
                              <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                              {errorMessage ||
                                "Failed to send message. Please try again."}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}

                    <div className="mt-4 text-xs text-zinc-500 font-mono flex items-center">
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                      <span>
                        System ready // All fields marked{" "}
                        <span className="text-pink-500">*</span> required
                      </span>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Console Controls */}
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <div className="w-3 h-12 bg-pink-500/30 rounded-sm"></div>
                <div className="w-3 h-12 bg-cyan-500/30 rounded-sm"></div>
              </div>

              <div className="text-xs text-zinc-500 font-mono">
                PORTFOLIO OS v2.0 //{" "}
                <span className="text-pink-500">CONTACT MODULE</span> //{" "}
                {new Date().toLocaleDateString()}
              </div>

              <div className="flex space-x-2">
                <div className="w-3 h-12 bg-cyan-500/30 rounded-sm"></div>
                <div className="w-3 h-12 bg-pink-500/30 rounded-sm"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
