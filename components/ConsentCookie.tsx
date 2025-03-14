'use client'
import { Alert, AlertTitle, Button, Grid, Stack, Typography } from '@mui/material'

import { useState, useEffect } from "react"
import Cookies from 'js-cookie'
import { useQueryState } from 'next-usequerystate';

const CookieFooter = ({consentCookie, setConsentCookie, resetCookie}) => {
    const [showAlert, setShowAlert] = useQueryState('show_permission')
    if (consentCookie === 'allow') {
        return <Stack direction={"row"} alignItems={"center"}>
            <Typography variant='caption'>You enabled Google Analytics in this website.</Typography>
            <Button sx={{padding: 0, color: "#81A1C1"}} onClick={(e)=>{
                // setConsentCookie('deny')
                window.scrollTo(0,0)
                setShowAlert('true')
            }}>Disable?</Button>
        </Stack>
    } else {
        return <Stack direction={"row"} alignItems={"center"}>
            <Typography variant='caption'>You disabled Google Analytics in this website.</Typography>
            <Button sx={{padding: 0, color: "#81A1C1"}} onClick={(e)=>{
                // setConsentCookie('allow')
                setShowAlert('true')
                window.scrollTo(0,0)
            }}>Enable?</Button>
        </Stack>
    }
}

export const CookieFooterWrapped = withCookie(CookieFooter)

export function withCookie<P>(Component: React.ComponentType<{[key:string]: any}>){
    const WrappedComponent = (props: {[key: string]: any}) => {
        const [consentCookie, setConsentCookie] = useState(Cookies.get(process.env.NEXT_PUBLIC_COOKIE_NAME))
        useEffect(()=>{
            Cookies.set(process.env.NEXT_PUBLIC_COOKIE_NAME, consentCookie)
        }, [consentCookie])
        
        const resetCookie  = () => {
            Cookies.remove(process.env.NEXT_PUBLIC_COOKIE_NAME)
            setConsentCookie(undefined)
        }

        return <Component {...props} consentCookie={consentCookie} setConsentCookie={setConsentCookie} resetCookie={resetCookie}/>
    }
    if (typeof process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID === 'undefined') return Component
    WrappedComponent.displayName = "WithCookie"
    return WrappedComponent

}

export const ConsentCookie = ({consentCookie, setConsentCookie, resetCookie}) => {
    const [showAlert, setShowAlert] = useQueryState('show_permission')
    if (showAlert !== 'true' && (consentCookie !== 'undefined' || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID === '' || process.env.NEXT_PUBLIC_COOKIE_NAME === '')) return null
    else {
        return(
            <Alert severity="info" id="cookieConsent">
                <AlertTitle>Cookie Policy</AlertTitle>
                <Grid container alignItems={"center"} spacing={2}>
                    <Grid item>
                        <Typography>Is it ok to have Google Analytics turned on while you are visiting this website?</Typography>
                    </Grid>
                    <Grid item>
                        <Button onClick={() => {
                            setConsentCookie('allow')
                            setShowAlert(null)
                        }} variant='outlined' color="secondary">I agree</Button>
                    </Grid>
                    <Grid item>
                        <Button onClick={() => {
                            setConsentCookie('deny')
                            setShowAlert(null)
                        }} variant='outlined' color="secondary">Decline</Button>
                    </Grid>
                </Grid>
            </Alert>
        )
    }
}


export default ConsentCookie