import { HiAcademicCap, HiDownload, HiLocationMarker, HiMail } from 'react-icons/hi';
import { SectionWrapper } from '../../../components';

const About = () => (
  <SectionWrapper id="about" title="About Me" subtitle="Research-minded engineering with practical outcomes">
    <div className="grid items-center gap-10 lg:grid-cols-[.8fr_1.2fr]">
      <img src="/assets/optimized/profile/me.webp" alt="Md Mehedi Hasan Naeem" width="800" height="1028" loading="lazy" decoding="async" className="mx-auto aspect-square w-full max-w-sm rounded-2xl object-cover shadow-xl" />
      <div>
        <h3 className="text-2xl font-bold">CSE student, researcher, and technical community contributor</h3>
        <p className="mt-4 max-w-3xl leading-relaxed text-gray-600 dark:text-gray-300">
          I study Computer Science and Engineering at Jatiya Kabi Kazi Nazrul Islam University. My work focuses on AI, computer vision, IoT, embedded systems, edge deployment, and research-driven web software.
        </p>
        <p className="mt-4 max-w-3xl leading-relaxed text-gray-600 dark:text-gray-300">
          I am especially interested in useful systems for agriculture, transportation, safety, education, and offline access. Alongside research and development, I contribute to technical leadership and student communities. My direction is to build trustworthy intelligent systems that can move from experiments into real environments.
        </p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 text-sm">
          <li className="flex items-center gap-2"><HiAcademicCap className="text-primary-500" /> B.Sc. in CSE, JKKNIU</li>
          <li className="flex items-center gap-2"><HiLocationMarker className="text-primary-500" /> Netrokona, Bangladesh</li>
          <li className="flex items-center gap-2"><HiMail className="text-primary-500" /> <a href="mailto:mehedinaeem00@gmail.com">mehedinaeem00@gmail.com</a></li>
        </ul>
        <a className="btn btn-primary mt-7" href="/assets/Md_Mehedi_Hasan_Naeem_CV.pdf" download>Download CV <HiDownload /></a>
      </div>
    </div>
  </SectionWrapper>
);
export default About;
