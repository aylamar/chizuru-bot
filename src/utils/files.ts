import { readdirSync } from 'fs';

export async function getFiles(searchDirectory: string): Promise<string[]> {
    let files: string[] = [];
    const items = readdirSync(searchDirectory, { withFileTypes: true });

    for (const item of items) {
        if (item.isDirectory()) {
            files = [...files, ...await getFiles(`${ searchDirectory }/${ item.name }`)];
        } else {
            if (!item.name.endsWith('.js')) continue;
            const path = `${ searchDirectory }/${ item.name.replace('.ts', '.js') }`;
            files.push(path);
        }
    }
    return files;
}
