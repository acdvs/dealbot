import Footer from '@/components/footer';
import Header from '@/components/header';
import UserMenu from '@/components/user-menu';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Header>
        <UserMenu />
      </Header>
      {children}
      <Footer />
    </div>
  );
}
