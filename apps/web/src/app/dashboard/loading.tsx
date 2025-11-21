import LoadingState from '@/components/state/loading';

export default function LoadingFallback() {
  return (
    <LoadingState className="fixed w-screen h-screen inset-0 bg-background" />
  );
}
