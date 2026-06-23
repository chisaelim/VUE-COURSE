
import pdfMake from 'pdfmake';
import { vfsFonts } from '@/assets/vfs_fonts.js';
import { vfsImages } from '@/assets/vfs_images.js';

pdfMake.addVirtualFileSystem(vfsFonts);
pdfMake.addVirtualFileSystem(vfsImages);

pdfMake.fonts = {
    Roboto: {
        normal: 'Roboto-Regular.ttf',
        bold: 'Roboto-Bold.ttf',
        italics: 'Roboto-Italic.ttf',
        bolditalics: 'Roboto-BoldItalic.ttf',
    },
    Arial: {
        normal: 'ARIAL.ttf',
        bold: 'ARIALBD.ttf',
        italics: 'ARIALI.ttf',
        bolditalics: 'ARIALBI.ttf',
    },
    Times: {
        normal: 'times.ttf',
        bold: 'timesbd.ttf',
        italics: 'timesi.ttf',
        bolditalics: 'timesbi.ttf',
    },
    KhmerOSMoul: {
        normal: 'KHMER OS MOUL REGULAR.ttf',
    },
    KhmerOSBattambong: {
        normal: 'KHMER OS BATTAMBANG REGULAR.ttf',
        bold: 'KHMER OS BATTAMBANG - BOLD.ttf',
    },
}
window.pdfMake = pdfMake;