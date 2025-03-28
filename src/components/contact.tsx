import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Mail, Phone, MapPin, Github, Linkedin, Twitter } from "lucide-react"

interface ContactProps {
  data: {
    email?: string
    phone?: string
    location?: string
    github?: string
    linkedin?: string
    twitter?: string
    [key: string]: string | undefined
  }
}

export function Contact({ data }: ContactProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // This would typically send the form data to a server
    console.log("Form submitted:", formData)
    alert("Message sent! (This is a demo)")
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    })
  }

  const contactItems = [
    { icon: Mail, label: "Email", value: data.email },
    { icon: Phone, label: "Phone", value: data.phone },
    { icon: MapPin, label: "Location", value: data.location },
    { icon: Github, label: "GitHub", value: data.github },
    { icon: Linkedin, label: "LinkedIn", value: data.linkedin },
    { icon: Twitter, label: "Twitter", value: data.twitter },
  ].filter((item) => item.value)

  return (
    <div>
      <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500 mb-8">
        Get In Touch
      </h2>

      <div className="grid md:grid-cols-[1fr_1.5fr] gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="group"
        >
          <Card className="h-full bg-zinc-900 border-zinc-800 group-hover:border-cyan-500/50 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-cyan-500">Contact Information</CardTitle>
              <CardDescription className="text-zinc-400">Get in touch through any of these channels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {contactItems.map((item, index) => (
                  <motion.div key={index} className="flex items-center gap-4" whileHover={{ x: 5 }}>
                    <div className="bg-zinc-800 p-3 rounded-full text-cyan-500">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium text-white">{item.label}</div>
                      <a
                        href={
                          item.label.toLowerCase() === "email"
                            ? `mailto:${item.value}`
                            : item.label.toLowerCase() === "phone"
                              ? `tel:${item.value}`
                              : item.value
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-zinc-400 hover:text-cyan-400 transition-colors duration-300"
                      >
                        {item.value}
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="group"
        >
          <Card className="bg-zinc-900 border-zinc-800 group-hover:border-pink-500/50 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-pink-500">Send Me a Message</CardTitle>
              <CardDescription className="text-zinc-400">Fill out the form and I'll get back to you</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-zinc-300">
                      Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="bg-zinc-800 border-zinc-700 focus:border-pink-500 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-zinc-300">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="bg-zinc-800 border-zinc-700 focus:border-pink-500 text-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-zinc-300">
                    Subject
                  </Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="bg-zinc-800 border-zinc-700 focus:border-pink-500 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-zinc-300">
                    Message
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="bg-zinc-800 border-zinc-700 focus:border-pink-500 text-white resize-none"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-pink-600 to-cyan-600 hover:from-pink-700 hover:to-cyan-700 text-white"
                >
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

