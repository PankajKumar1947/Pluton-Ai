import { Skeleton } from "@/components/ui/skeleton"

export default function CodeLoader() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white px-4">
            <h2 className="text-xl md:text-2xl font-semibold mb-2">Getting Your Files and Code...</h2>
            <p className="text-sm text-gray-400 mb-6">This might take a few seconds. Sit tight 🚀</p>

            <div className="bg-gray-900 text-green-400 w-full max-w-4xl rounded-md shadow-lg p-4 font-mono border border-gray-800 h-[500px] overflow-hidden">
                <div className="space-y-2 animate-pulse">
                    <Skeleton className="h-4 w-[80%] bg-gray-700" />
                    <Skeleton className="h-4 w-[60%] bg-gray-700" />
                    <Skeleton className="h-4 w-[90%] bg-gray-700" />
                    <Skeleton className="h-4 w-[70%] bg-gray-700" />
                    <Skeleton className="h-4 w-[85%] bg-gray-700" />
                    <Skeleton className="h-4 w-[55%] bg-gray-700" />
                    <Skeleton className="h-4 w-[95%] bg-gray-700" />
                    <Skeleton className="h-4 w-[60%] bg-gray-700" />
                    <Skeleton className="h-4 w-[75%] bg-gray-700" />
                    <Skeleton className="h-4 w-[90%] bg-gray-700" />
                    <Skeleton className="h-4 w-[80%] bg-gray-700" />
                    <Skeleton className="h-4 w-[60%] bg-gray-700" />
                    <Skeleton className="h-4 w-[90%] bg-gray-700" />
                    <Skeleton className="h-4 w-[70%] bg-gray-700" />
                    <Skeleton className="h-4 w-[85%] bg-gray-700" />
                    <Skeleton className="h-4 w-[55%] bg-gray-700" />
                    <Skeleton className="h-4 w-[95%] bg-gray-700" />
                    <Skeleton className="h-4 w-[60%] bg-gray-700" />
                    <Skeleton className="h-4 w-[75%] bg-gray-700" />
                    <Skeleton className="h-4 w-[90%] bg-gray-700" />
                </div>
            </div>

            <div className="mt-6 text-sm text-gray-400 flex items-center gap-1">
                <span>Loading</span>
                <span className="animate-bounce delay-0">.</span>
                <span className="animate-bounce delay-100">.</span>
                <span className="animate-bounce delay-200">.</span>
            </div>
        </div>
    )
}
