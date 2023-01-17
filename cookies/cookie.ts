
export class CookieManager {
    constructor(){

    }
    /**
     * 
     * * GetCookie from cname
     * ? Decode document.cookie to read
     */
    public getCookie(cname: string): string | null {
        let name = cname + "="
        let decodedCookie = decodeURIComponent(document.cookie)
        let ca = decodedCookie.split(";")
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i]
            while (c.charAt(0) == " ") {
                c = c.substring(1)
            }
            if (c.indexOf(name) == 0) {
                return atob(c.substring(name.length, c.length))
            }
        }
        return null
    }

    /**
     * * SetCookie with Name, Value, Expire Time
     * ? Set expire date and converted
     * ? saving in document.cookie
     */
    public setCookie(name: string, value: string, milis: number | null): void {
        var expires = ""
        if (milis) {
            var date = new Date(Date.now() + milis)
            expires = "; expires=" + date.toUTCString()
        }
        document.cookie = name + "=" + (btoa(value) || "") + expires + "; path=/"
    }

    /**
     * * Delete Cookie with Name, Path, Domain
     * @param {String} name 
     * @param {String} path 
     * @param {String} domain 
     */
    public deleteCookie(name: string, path: string | null, domain: string | null) {
        if (this.getCookie(name)) document.cookie = name + '=' +
            ((path) ? ';path=' + path : '') +
            ((domain) ? ';domain=' + domain : '') +
            ';expires=Thu, 01-Jan-1970 00:00:01 GMT';
    }

}
