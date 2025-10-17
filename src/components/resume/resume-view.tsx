"use client";

import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RippleButton } from "@/components/ui/ripple-button";
import resume from "@/constants/resume.json";

export function ResumeView() {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "/zero-resume.pdf";
    link.download = "Nikhil_Resume.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <h1 className="text-3xl font-bold mb-4">Resume</h1>
        <p className="text-zinc-400 max-w-2xl mx-auto">
          View and download my professional resume
        </p>
      </motion.div>

      {/* Download button */}
      <div className="flex justify-center mb-8">
        <RippleButton onClick={handleDownload} rippleColor="#ADD8E6">
          <div className="flex items-center justify-center">
            <Download className="mr-2 h-4 w-4" />
            Download Resume
          </div>
        </RippleButton>
      </div>

      {/* Resume content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="max-w-4xl mx-auto"
      >
        <Card className="bg-zinc-900 border-zinc-800 overflow-hidden print:shadow-none">
          <CardContent className="p-8">
            {/* Header */}
            <div className="mb-8 border-b border-zinc-800 pb-6">
              <h2 className="text-2xl font-bold mb-2">{resume.name}</h2>
              <p className="text-zinc-400 mb-4">{resume.summary}</p>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm text-zinc-500">Location:</p>
                  <p className="text-zinc-300">{resume.contact.location}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Contact:</p>
                  <a
                    href={`tel:${resume.contact.phone}`}
                    className="text-zinc-300 hover:text-blue-400 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    {resume.contact.phone}
                  </a>
                  <a
                    href={`mailto:${resume.contact.email}`}
                    className="text-zinc-300 hover:text-blue-400 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    {resume.contact.email}
                  </a>
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Social:</p>
                  <p className="text-zinc-300">
                    Twitter: {resume.contact.social.twitter}
                  </p>
                  <p className="text-zinc-300">
                    Github: {resume.contact.social.github}
                  </p>
                </div>
              </div>
            </div>

            {/* Experience */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 border-b border-zinc-800 pb-2">
                EXPERIENCE
              </h3>
              {resume.experience.map((exp, idx) => (
                <div key={idx} className="mb-6">
                  <h4 className="text-lg font-medium mb-1">{exp.title}</h4>
                  {exp.duration && (
                    <p className="text-zinc-500 text-sm mb-2">{exp.duration}</p>
                  )}
                  <p className="text-zinc-400 mb-2">{exp?.description}</p>
                  {exp.projects && (
                    <ul className="list-disc pl-5 text-zinc-400 space-y-1">
                      {exp.projects.map((proj, i) => (
                        <li key={i}>{proj}</li>
                      ))}
                    </ul>
                  )}
                  {exp.keyProject && (
                    <div className="mt-4">
                      <h5 className="font-medium mb-1">
                        {exp.keyProject.title}
                      </h5>
                      <ul className="list-disc pl-5 text-zinc-400 space-y-1">
                        {exp.keyProject.highlights.map((pt, i) => (
                          <li key={i}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Education */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 border-b border-zinc-800 pb-2">
                EDUCATION
              </h3>
              {resume.education.map((edu, i) => (
                <div key={i} className="mb-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium mb-1">{edu.degree}</h4>
                      <p>-</p>
                      <p className="text-zinc-400 mb-1">{edu.institution}</p>
                    </div>
                    <p className="text-zinc-500 text-sm">{edu.duration}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Sample Projects */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 border-b border-zinc-800 pb-2">
                PROJECTS
              </h3>
              {resume.projects.map((proj, i) => (
                <div key={i} className="mb-6">
                  {/* name, type, description, link */}
                  <h4 className="font-medium mb-1">
                    {proj.name}{" "}
                    <span className="text-zinc-500 text-sm">({proj.type})</span>
                  </h4>
                  <p className="text-zinc-400 mb-1">{proj.description}</p>
                  <a
                    href={proj.link}
                    className="text-blue-300 text-sm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Project
                  </a>
                </div>
              ))}
            </div>

            {/* Skills */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 border-b border-zinc-800 pb-2">
                SKILLS
              </h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {resume.skills.map((skill) => (
                  <Badge key={skill} className="bg-zinc-800 text-zinc-300">
                    {skill}
                  </Badge>
                ))}
              </div>

              <h4 className="font-medium mb-2">Tools</h4>
              <div className="flex flex-wrap gap-2">
                {resume.tools.map((tool) => (
                  <Badge
                    key={tool}
                    variant="outline"
                    className="border-zinc-700 text-zinc-400"
                  >
                    {tool}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 border-b border-zinc-800 pb-2">
                ACHIEVEMENT & ACTIVITIES
              </h3>
              {resume.achievements.map((ach, i) => (
                <div key={i} className="mb-4">
                  <h4 className="font-medium mb-1">{ach.title}</h4>
                  <p className="text-zinc-400">{ach.description}</p>
                  <p className="text-zinc-500 text-sm">Link: {ach.link}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
