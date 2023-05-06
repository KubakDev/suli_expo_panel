import { redirect, type RequestHandler } from "@sveltejs/kit";
export const POST = async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password
    });
    // subscribe the user to the newsletter
    throw redirect(303, '/dashboard');

}
