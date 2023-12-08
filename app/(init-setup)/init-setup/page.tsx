import { prisma } from '@/lib/prisma';
import { AdminAccountAddForm} from './AdminAccountAddForm';
import { redirect } from 'next/navigation';
export default async function InitSetupPage() {
  const adminCount = await prisma.user.count({where: {isAdmin: true}});

  //이미 관리자 계정이 존재하는 경우
  if (adminCount != 0) {
    redirect('/');
  }
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
        Let's set up the administrator account:
      </p>
      <AdminAccountAddForm />
    </>
  );
}
