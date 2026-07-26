import { HiChip, HiCode, HiDesktopComputer, HiLightBulb } from 'react-icons/hi';
import { SectionWrapper } from '../../../components';

const coreSkills = [
  {
    title: 'Artificial Intelligence',
    icon: HiLightBulb,
    skills: ['Machine Learning', 'Deep Learning', 'Computer Vision'],
  },
  {
    title: 'IoT and Edge Systems',
    icon: HiChip,
    skills: ['Raspberry Pi', 'ESP32', 'Sensors'],
  },
  {
    title: 'Software Development',
    icon: HiCode,
    skills: ['Python', 'React', 'Django'],
  },
  {
    title: 'Research Engineering',
    icon: HiDesktopComputer,
    skills: ['Data Analysis', 'Model Evaluation', 'Prototyping'],
  },
];

const Skills = () => (
  <SectionWrapper
    id="skills"
    title="Core Skills"
    subtitle="The main capabilities I use to build practical intelligent systems"
    dark
  >
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {coreSkills.map((group) => (
        <article className="card p-6" key={group.title}>
          <div className="mb-4 inline-flex rounded-xl bg-primary-100 p-3 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300">
            <group.icon className="h-6 w-6" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-bold">{group.title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            {group.skills.join(' · ')}
          </p>
        </article>
      ))}
    </div>
  </SectionWrapper>
);

export default Skills;
