


export function createPageUrl(pageName: string) {
    return '/HEAUT/' + pageName.toLowerCase().replace(/ /g, '-');
}