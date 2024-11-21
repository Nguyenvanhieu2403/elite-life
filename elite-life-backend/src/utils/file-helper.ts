import * as fs from 'fs'
import * as path from 'path'

export class FileHelper {
    static SaveFile(file: Express.Multer.File, distPath: string, fileName: string) {
        if (!fs.existsSync(distPath)) fs.mkdirSync(distPath, { recursive: true });
        var image_base64 = fs.readFileSync(path.resolve(file.path), "base64");
        fs.rmSync(path.resolve(file.path), { force: true });
        fs.writeFileSync(path.resolve(distPath, fileName), image_base64, { flag: 'w', encoding: 'base64' });
    }
    static Exist(distPath: string) {
        return fs.existsSync(distPath);
    }
    static SaveFileWithTmp(file: Express.Multer.File, distPath: string, fileName: string) {
        if (!fs.existsSync(distPath)) fs.mkdirSync(distPath, { recursive: true });
        var image_base64 = fs.readFileSync(path.resolve(file.path), "base64");
        fs.writeFileSync(path.resolve(distPath, fileName), image_base64, { flag: 'w', encoding: 'base64' });
    }
}