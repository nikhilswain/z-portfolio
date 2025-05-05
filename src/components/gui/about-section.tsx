import { motion } from "framer-motion";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { TextReveal } from "@/components/ui/text-reveal";

interface AboutSectionProps {
  data: {
    bio: string[];
    education: {
      degree: string;
      institution: string;
      year: string;
    }[];
    experience: {
      position: string;
      company: string;
      duration: string;
      description: string;
    }[];
  };
}

export function AboutSection({ data }: AboutSectionProps) {
  return (
    <section className="py-24 bg-black overflow-hidden relative">
      <div className="relative z-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500">
              About Me
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-cyan-500 mx-auto"></div>
          </motion.div>

          {/* Bio Paragraphs with TextReveal */}
          <div className="max-w-3xl mx-auto space-y-32 mt-12">
            {data?.bio?.map((paragraph, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative m-0"
              >
                <TextReveal className="overflow-hidden">{paragraph}</TextReveal>
              </motion.div>
            ))}
          </div>

          {/* Experience & Education Timeline */}
          <div className="relative mt-32 px-0 lg:px-16">
            {/* Section Title */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="mb-16 text-center"
            >
              <h3 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500">
                Journey & Achievements
              </h3>
              <div className="w-16 h-0.5 bg-gradient-to-r from-pink-500 to-cyan-500 mx-auto"></div>
            </motion.div>

            {/* Timeline */}
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-pink-500/50 via-cyan-500/50 to-pink-500/50"></div>

              <div className="space-y-20">
                {/* Experience Timeline Items */}
                {data?.experience?.map((exp, index) => (
                  <div key={index} className="relative">
                    {/* Timeline dot */}
                    <motion.div
                      className="absolute left-1/2 top-0 transform -translate-x-1/2 w-4 h-4 rounded-full bg-pink-500 shadow-lg shadow-pink-500/50 z-10"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 15,
                        delay: 0.2,
                      }}
                      viewport={{ once: true }}
                    ></motion.div>

                    {/* Content */}
                    <div
                      className={`flex flex-col md:flex-row items-center ${
                        index % 2 === 0 ? "md:flex-row-reverse" : ""
                      }`}
                    >
                      {/* Date */}
                      <motion.div
                        className={`md:w-1/2 mb-4 md:mb-0 ${
                          index % 2 === 0 ? "md:pl-12" : "md:pr-12"
                        } text-center ${index % 2 === 0 ? "md:text-left" : ""}`}
                        initial={{ opacity: 0, x: index % 2 === 0 ? 50 : -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                      >
                        <span className="inline-block px-4 py-2 bg-zinc-800/80 rounded-full text-pink-400 font-mono text-sm border border-pink-500/20">
                          {exp.duration}
                        </span>
                      </motion.div>

                      {/* Experience Card */}
                      <motion.div
                        className={`md:w-1/2 ${
                          index % 2 === 0 ? "md:pr-12" : "md:pl-12"
                        }`}
                        initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        whileHover={{ y: -5 }}
                      >
                        <div className="bg-zinc-900/50 backdrop-blur-sm p-6 rounded-lg border border-zinc-800 hover:border-pink-500/30 transition-all duration-300 shadow-lg cursor-none">
                          <h4 className="text-xl font-bold text-white mb-1">
                            {exp.position}
                          </h4>
                          <p className="text-pink-400 mb-3">{exp.company}</p>
                          <p className="text-zinc-400 text-sm">
                            {exp.description}
                          </p>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                ))}

                {/* Education Timeline Items */}
                {data?.education?.map((edu, index) => (
                  <div key={index} className="relative">
                    {/* Timeline dot */}
                    <motion.div
                      className="absolute left-1/2 top-0 transform -translate-x-1/2 w-4 h-4 rounded-full bg-cyan-500 shadow-lg shadow-cyan-500/50 z-10"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 15,
                        delay: 0.2,
                      }}
                      viewport={{ once: true }}
                    ></motion.div>

                    {/* Content */}
                    <div
                      className={`flex flex-col md:flex-row items-center ${
                        index % 2 === 1 ? "md:flex-row-reverse" : ""
                      }`}
                    >
                      {/* Date */}
                      <motion.div
                        className={`md:w-1/2 mb-4 md:mb-0 ${
                          index % 2 === 1 ? "md:pl-12" : "md:pr-12"
                        } text-center md:text-right ${
                          index % 2 === 1 ? "md:text-left" : ""
                        }`}
                        initial={{ opacity: 0, x: index % 2 === 1 ? 50 : -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                      >
                        <span className="inline-block px-4 py-2 bg-zinc-800/80 rounded-full text-cyan-400 font-mono text-sm border border-cyan-500/20">
                          {edu.year}
                        </span>
                      </motion.div>

                      {/* Education Card */}
                      <motion.div
                        className={`md:w-1/2 ${
                          index % 2 === 1 ? "md:pr-12" : "md:pl-12"
                        }`}
                        initial={{ opacity: 0, x: index % 2 === 1 ? -50 : 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        whileHover={{ y: -5 }}
                      >
                        <div className="bg-zinc-900/50 backdrop-blur-sm p-6 rounded-lg border border-zinc-800 hover:border-cyan-500/30 transition-all duration-300 shadow-lg cursor-none">
                          <h4 className="text-xl font-bold text-white mb-1">
                            {edu.degree}
                          </h4>
                          <p className="text-cyan-400">{edu.institution}</p>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                ))}

                {/* End dot */}
                <motion.div
                  className="absolute left-1/2 bottom-0 transform -translate-x-1/2 w-6 h-6 rounded-full bg-gradient-to-r from-pink-500 to-cyan-500 shadow-lg shadow-pink-500/50 z-10"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 15,
                    delay: 0.4,
                  }}
                  viewport={{ once: true }}
                ></motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Beams Effect */}
      <BackgroundBeams />
    </section>
  );
}
