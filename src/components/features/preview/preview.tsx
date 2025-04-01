import { useEffect, useState } from 'react';

function convertToWebContainersFormat(items: any[]): any {
    const result: any = {};

    items.forEach(item => {
        if (item.type === 'file') {
            result[item.filePath] = {
                file: {
                    contents: item.content
                }
            };
        } else if (item.type === 'folder') {
            result[item.folderPath] = {
                directory: convertToWebContainersFormat(item.files)
            };
        }
    });

    return result;
}


export default function Preview({ files, webContainerInstance, url, setUrl }: any) {
    const [status, setStatus] = useState('Setting up WebContainer...');
    const [error, setError] = useState('');

    useEffect(() => {
        const init = async () => {
            try {
                setStatus('Formatting files...');
                const formattedFiles = convertToWebContainersFormat(files);
                console.log('Formatted files:', formattedFiles);

                if(url)
                    return ;

                setStatus('Mounting files...');
                await webContainerInstance.mount(formattedFiles);

                // Output handler
                const outputHandler = (data: string) => {
                    console.log(data);
                    setStatus(prev => prev + '\n' + data);
                };

                setStatus('Installing dependencies...');
                const installProcess = await webContainerInstance.spawn('npm', ['install']);

                const installExitCode = await new Promise<number>((resolve) => {
                    installProcess.output.pipeTo(
                        new WritableStream({
                            write(data) {
                                outputHandler(data);
                            }
                        })
                    );

                    installProcess.exit.then(resolve);
                });

                if (installExitCode !== 0) {
                    throw new Error(`Installation failed with exit code ${installExitCode}`);
                }

                setStatus('Starting development server...');
                const devProcess = await webContainerInstance.spawn('npm', ['run', 'dev']);

                devProcess.output.pipeTo(
                    new WritableStream({
                        write(data) {
                            outputHandler(data);
                        }
                    })
                );

                // Wait for server-ready event
                webContainerInstance.on('server-ready', (port: number, serverUrl: string) => {
                    console.log(`Server ready on port ${port} at ${serverUrl}`);
                    setStatus(`Server ready at ${serverUrl}`);
                    setUrl(serverUrl);
                });


            } catch (err) {
                console.error('Error initializing WebContainer:', err);
                setError(err instanceof Error ? err.message : String(err));
                setStatus('Failed to initialize WebContainer');
            }
        };

        init();
        // Cleanup function
        return () => {
            // We don't actually clean up the global webcontainerInstance here
            // as it's meant to be a singleton for the whole app
        };

    }, []);

    return (
        <div className="h-full flex flex-col">
            {!url ? (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                    <div className="text-center p-4">
                        <p className="mb-2 font-semibold">{status.split('\n')[0]}</p>
                        <pre className="text-left text-xs max-h-40 overflow-auto p-2 bg-gray-100 rounded">
                            {status.split('\n').slice(1).join('\n')}
                        </pre>
                    </div>
                </div>
            ) : (
                <iframe
                    className="flex-1 w-full"
                    src={url}
                    title="Preview"
                    sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-same-origin allow-scripts allow-top-navigation"
                />
            )}
        </div>
    );
}