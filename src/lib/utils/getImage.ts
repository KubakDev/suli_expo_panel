export function getImage(imageUrl: string) {
	return imageUrl
		? ` ${import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL}/${imageUrl}`
		: '../images/image/notFound.jpg';
}
