import { prisma } from '@/lib/prisma';
import { MailerForm} from './MailAddForm';
import { redirect } from 'next/navigation';
export default async function InitSetupPage2() {

  return (
    <>
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
        Welcome
      </h2>
      <p className="text-gray-600 mb-6 text-center">
        Welcome to HomeCam.me! The Setup Assistant will guide you to setup the
        environment.
      </p>
      <p className="text-gray-700 mb-4">
        Please add the Gmail account, to receive a notification from the server:
      </p>
      <MailerForm />
    </>
  );
}
