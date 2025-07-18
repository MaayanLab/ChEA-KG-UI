
'use client'
import { useState, useEffect } from "react"
import { Alert, Button, AlertTitle, Grid, Typography } from '@mui/material'
import Zoom from '@mui/material/Zoom'

const styles = {
	active: {
        backgroundColor:"#02536b",
        color:"#ffffff",
		opacity: 1,
		"&:hover": {
            backgroundColor:"#0381a6",

		},
		boxShadow: "1",
		position: 'relative'
	}
  }

export const Annoucement = () => {
    const [visible, setVisible] = useState(true);
    // keeps annoucement from reloading on page refresh or tab switch

    useEffect(() => {
        const handleUnload = () => {
            sessionStorage.removeItem('announcementClosed'); // Or any other item
        };

        window.addEventListener('unload', handleUnload);

        return () => {
            window.removeEventListener('unload', handleUnload);
        };
    }, [])

    useEffect(() => {
        const closed = sessionStorage.getItem("announcementClosed");
        if (closed === null) {
          setVisible(true);
        } else {
            setVisible(false)
        }
       
      }, [])
    
    const handleClose = () => {
        setVisible(false)
        sessionStorage.setItem("announcementClosed", "true");
    }

    return(
        <>
        {visible &&
            <Zoom in={visible}>
                <Alert severity="info" id="seminar" sx={{ backgroundColor:"#f2fcff", boxShadow: 3}} onClose={handleClose}>
                    <AlertTitle>&#x1f9ec; <b>Join us for an upcoming seminar about ChEA-KG!</b> &#x1f9ec;</AlertTitle>
                    <Grid container alignItems={"center"} spacing={2}>
                        <Grid item>
                            <Typography>We’re excited to invite you to an upcoming webinar about <b>ChEA-KG</b> in the <b>Omics Tools Seminar Series</b>  hosted by the <b>Ma’ayan Lab</b> and the <b>Mount Sinai Center for Bioinformatics</b>. The session will take place from <b>2-3pm on July 24, 2025.</b> </Typography>
                        </Grid>
                        <Grid item>
                            <Button component="a" href='https://maayanlab.cloud/turl/35e9d6a0' target="_blank" rel="noopener noreferrer" variant='outlined' sx={styles.active}><b>Details and Registration</b></Button>
                        </Grid>
                    </Grid>
                </Alert>
            </Zoom>
        }
            
        </>
        
        
    )
    
}