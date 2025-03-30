import { ScrollArea } from "@/components/ui/scroll-area"
import { File, Folder } from "lucide-react";
import { useState } from "react";

export default function FileStructure({ files, setActiveFile }: any) {
    return (
        <div className="h-full">
            <h4 className="p-2 text-sm font-medium leading-none">Files</h4>
            <ScrollArea className="h-full rounded-md border">
                <div className="py-2 -ml-2">
                    <List files={files} setActiveFile={setActiveFile} />
                </div>
            </ScrollArea>
        </div>
    )
}

const List = ({ files, setActiveFile }: any) => {
    const [folderOpen, setFolderOpen] = useState(false);
    return (
        <div className="text-sm space-y-1 pl-4">
            {files?.map((file: any, ind: number) => (
                <div key={ind} className="space-y-2">
                    <div key={ind} className="text-sm">{
                        file?.type === "file" ? <div onClick={() => setActiveFile(file)} className="flex items-center cursor-pointer hover:opacity-80">
                            <File className="h-4" />
                            {file?.filePath}
                        </div> : <div onClick={() => setFolderOpen(!folderOpen)} className="flex items-center cursor-pointer hover:opacity-80">
                            <Folder className="h-4" />
                            {file?.folderPath}
                        </div>
                    }</div>
                    {folderOpen && file?.files?.length > 0 && <List files={file?.files} setActiveFile={setActiveFile} />}
                </div>
            ))}
        </div>
    )
}