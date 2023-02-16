import  { AuthError, createClient, SupabaseClient, User } from "@supabase/supabase-js";
import { UserProfile } from "./user/user.model";
import { CookieManager } from "./cookies/cookie"




export class VirtualOSCore {
    supabase : SupabaseClient<any, "public", any>
    cookies : CookieManager;

    refresh_token : string | null
    access_token : string | null

    constructor(supabaseUrl: string, supabaseKey: string) {
        if (supabaseUrl  == null || supabaseKey == null) {
            return
        }

        this.supabase = createClient(supabaseUrl,supabaseKey)
        this.cookies = new CookieManager();

        let refresh_token = this.cookies.getCookie("refresh_token")
        let access = this.cookies.getCookie("access_token")

        if (refresh_token == null || access == null ) {
        } else {
            this.refresh_token = refresh_token
            this.access_token = access

            this.supabase.auth.setSession({
                refresh_token: this.refresh_token,
                access_token: this.access_token
            })
        }
    }


    public async SignInWithGoogle() : Promise<Error | null>
    {
        const result = await this.supabase.auth.signInWithOAuth({provider : "google"});
        if(result.error != null) {
            return new Error(result.error.message)
        }

        const { data:{session},error} = await this.supabase.auth.getSession()
        if (error != null) {
            return new Error(error.message)
        }

        this.cookies.setCookie("refresh_token",session.refresh_token,null);
        this.cookies.setCookie("access_token",session.access_token,null);
    }

    public async SignOut() : Promise<Error | null> 
    {
        const {error} = await this.supabase.auth.signOut()
        if (error != null) {
            return new Error(error.message)
        }

        this.cookies.deleteCookie("refresh_token",null,null);
        this.cookies.deleteCookie("access_token",null,null);
    }


    public async IsSignedIn() : Promise<boolean> {
        return (await this.supabase.auth.getSession()).data.session != null;
    }

    public async getProfile() : Promise<{profile: UserProfile|null;error: Error|null}> {
        const {data,error} = await this.supabase.from("user_profile")
            .select("metadata,email")
        
        if (error != null) {
            return {
                profile: null,
                error: new Error(error.message)
            }
        }

        return {
            profile: {
            email: data[0].email,
            metadata: data[0].metadata
        }, error: null};
    }




    public async CreateUserApplication() : Promise<{data: any,error :Error}> 
    {
        const {data,error} = await this.supabase.from("user_application") .insert({
                
            }).select()

        if (error != null) {
            return {
                data: null,
                error: new Error(error.message)
            }
        }
    }
}