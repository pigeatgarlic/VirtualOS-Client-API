import  { AuthError, createClient, SupabaseClient, User } from "@supabase/supabase-js";
import { UserProfile } from "./user/user.model";
import { CookieManager } from "./cookies/cookie"


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;


export class VirtualOSCore {
    supabase : SupabaseClient<any, "public", any>
    cookies : CookieManager;

    profile : UserProfile | null
    refresh_token : string | null
    access_token : string | null

    constructor() {
        if (supabaseUrl  == null || supabaseKey == null) {
            return
        }

        this.supabase = createClient(supabaseUrl,supabaseKey)
        this.cookies = new CookieManager();

        let refresh_token = this.cookies.getCookie("refresh_token")
        let access = this.cookies.getCookie("access_token")

        if (refresh_token == null || access == null ) {
            this.profile = null;
        } else {
            this.refresh_token = refresh_token
            this.access_token = access

            this.supabase.auth.setSession({
                refresh_token: this.refresh_token,
                access_token: this.access_token
            })

            this.fetchUserProfile().catch((err) => {
                console.log(err);
            })
        }
    }


    private async fetchUserProfile() : Promise<void> {
        const user = await this.supabase.auth.getUser()
        if (user.error != null) {
            return
        }

        const profile = await this.supabase.from("profile")
            .select("username, account_id")
            .eq("account_id",user.data.user?.id)

        if (profile.error != null) {
            return
        }

        this.profile = {
            username : profile.data[0].account_id,
            email : user.data.user?.email
        };
    }

    public async SignInWithGoogle() : Promise<Error | null>
    {
        if((await this.IsSignedIn()) == true) {
            return new Error("already signed in")
        }

        const result = await this.supabase.auth.signInWithOAuth({provider : "google"});
        if(result.error != null) {
            return new Error(result.error.message)
        }

        const session = await (await this.supabase.auth.getSession()).data.session
        if (session == null) {
            throw new Error("no session")
        }

        this.cookies.setCookie("refresh_token",session.refresh_token,null);
        this.cookies.setCookie("access_token",session.access_token,null);

        await this.fetchUserProfile();
    }

    public async IsSignedIn() : Promise<boolean> {
        return (await this.supabase.auth.getSession()).data.session != null;
    }
    public getProfile() : UserProfile {
        return this.profile
    }
}


const out = new VirtualOSCore();

export {out};