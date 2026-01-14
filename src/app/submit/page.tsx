import { SubmitToolForm } from '@/components/SubmitToolForm';

export const metadata = {
  title: 'Submit an AI Tool | RobotDance',
  description: 'Submit a new AI tool to be listed on RobotDance. Help grow our directory of AI solutions.',
};

export default function SubmitPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <SubmitToolForm />
    </main>
  );
}
