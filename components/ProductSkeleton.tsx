export function ProductSkeleton() {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden animate-pulse flex flex-col justify-between h-[360px]">
      <div className="h-56 bg-gray-800 w-full"></div>
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="h-5 bg-gray-800 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-800 rounded w-1/2"></div>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="h-6 bg-gray-800 rounded w-20"></div>
          <div className="h-10 bg-gray-800 rounded w-28"></div>
        </div>
      </div>
    </div>
  );
}
