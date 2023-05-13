import { redirect, type RequestHandler } from "@sveltejs/kit";
// export const POST = async ({ request, locals: { supabase } }) => {
//     const formData = await request.formData();

//     const email = formData.get('email') as string;
//     const password = formData.get('password') as string;

//     console.log('redirecting to dashboard');
//     const { error } = await supabase.auth.signInWithPassword({
//         email,
//         password
//     });
//     return {
//         status: 401,
//         body: JSON.stringify({ error: 'error.message '})
//     };

// }


/** @type {import('./$types').RequestHandler} */
export async function POST({ request, locals: { supabase } }) {
    const formData = await request.formData();

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    console.log('redirecting to dashboard');
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password
    });
    // return {
    //     status: 401,
    //     body: JSON.stringify({ error: 'error.message ' })
    // };
}