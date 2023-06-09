import axios from "axios";
import jwtDecode from "jwt-decode";

type tokenPayload = {
    email: string
    name: string
    createdAt: string
    updatedAt: string
    __v: number
    session: string
    iat: number
    exp: number
}

const instance = axios.create({
    baseURL: "http://localhost:1337"
}
)

export const getToken = () => {
    const token = localStorage.getItem("access-token")
    if (typeof token === "string") return token
    return ""
}

export const setAccessToken = (token: string) => {
    localStorage.setItem("access-token", token)
}

export const setRefreshToken = (token: string) => {
    localStorage.setItem("refresh-token", token)
}

const isTokenExpired = () => {
    if (getToken()) {
        const decoded: tokenPayload = jwtDecode(getToken() as string)
        return decoded.exp < new Date().getTime() / 1000
    }
}

const getRefreshedToken = async () => {
    const result = await axios.get("http://localhost:1337/refresh", { headers: { "x-refresh": localStorage.getItem("refresh-token") } })
    return result
}

const newAccessToken = async () => {
    const request = await getRefreshedToken()
    const data = await request.data
    if (typeof data.token === "string") {
        setAccessToken(data.token)
        return data.token
    }

}


instance.interceptors.request.use(async (req) => {
    if (isTokenExpired()) {
        const token = await newAccessToken()
        req.headers["Authorization"] = `Bearer ${token}`
        return req
    }
    const accessToken = getToken()
    req.headers["Authorization"] = `Bearer ${accessToken}`
    return req
})

export default instance