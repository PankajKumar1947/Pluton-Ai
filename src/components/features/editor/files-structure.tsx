import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

const tags = Array.from({ length: 50 }).map(
    (_, i, a) => `File${a.length - i}`
)

export default function FileStructure() {
    return (
        <div className="h-full">
            <ScrollArea className="h-full rounded-md border">
                <div className="p-2">
                    <h4 className="mb-4 text-sm font-medium leading-none">Files</h4>
                    {tags.map((tag) => (
                        <div key={tag}>
                            <div className="text-sm">
                                {tag}
                            </div>
                            <Separator className="my-2" />
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    )
}