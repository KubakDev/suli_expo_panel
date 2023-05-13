

export function createRandomString(): string {
    let result: string = '';
    const characters: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength: number = characters.length;
    // Ensure the first character is a letter
    result += characters.charAt(Math.floor(Math.random() * 52)); // 52 because there are 52 letters in the English alphabet (26 uppercase + 26 lowercase)

    for (let i = 1; i < 10; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}