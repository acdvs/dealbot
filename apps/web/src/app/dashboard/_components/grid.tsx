function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-2">
      {children}
    </div>
  );
}

export default Grid;
