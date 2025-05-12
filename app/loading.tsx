export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/20">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
        <p className="mt-4 text-gray-600">Loading application...</p>
      </div>
    </div>
  )
}
