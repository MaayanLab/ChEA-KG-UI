import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Link from "next/link"
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import CardMedia from '@mui/material/CardMedia'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import { Stack } from '@mui/material'

export const UseCase = ({title, description, src, image, launch, index}:
    {
        title: string,
        description: string,
        src: string,
        image: string,
        launch: string,
        index: number
    }) => {
        return (
            <>
                <Card
                    key={index}
                    sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                <CardHeader
                    title={
                        <Typography variant="h2" align='center' sx={{ fontWeight: 'bold' }}>
                            {title}
                        </Typography>}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                        <Stack
                        sx= {{
                            display: 'flex',
                            height:'100%',
                            flexDirection: 'column',
                            justifyContent:'space-between'
                        }}>
                            <CardMedia
                                component='img'
                                image={image}
                                alt={title}
                            />
                            <Box >
                                <Typography variant="body1" align = 'left' noWrap={false} sx={{paddingBottom:2, flexGrow: 1}}>
                                    {description}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'center' }}> 
                                <Button 
                                    href={src} 
                                    key={title} 
                                    size="large"
                                    variant="contained"
                                    color='primary'
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    sx={{
                                        align: 'center',
                                        padding: "2px 10px 2px 10px",                                    
                                    }}
                                    > 
                                    {launch} 
                                    </Button>

                            </Box>
                        </Stack>
                    </CardContent>
                </Card>

            </>

        )
    }

export default function UseCaseLib({usecaselib}: 
    
    {
        usecaselib?:
            Array<{
                title: string,
                description: string,
                image: string,
                src: string,
                launch: string
                }> 
    }
    
    ) {
    return(
            <>
            <Typography variant="h2" align='center' sx={{ fontWeight: 'bold' , paddingBottom:2}}>
                Appyter Workflows for Analyzing Gene Sets with ChEA-KG 
            </Typography>
            <Typography variant="body1" align='center' sx={{ paddingBottom:4}}>
                The ChEA-KG API has been extended to identify and analyze enriched regulatory subnetworks within two  
                <Link href="https://appyters.maayanlab.cloud/" target="_blank" rel="noopener noreferrer"><b> Appyter </b></Link> 
                 notebook workflows, which extend Jupyter notebooks to create functional standalone web-based applications. Read more about and try out each Appyter below.
            </Typography>
            <Grid container columnSpacing={2}>
            {usecaselib.map((el, i) => (
                <Grid item xs={12} key={i} md={6} sx={{ display: 'flex' }}>
                    <UseCase
                        title={el.title}
                        description={el.description}
                        src={el.src}
                        image={el.image}
                        launch={el.launch}
                        index={i}
                    />

                </Grid>
                ))

            }
            </Grid>
            </>        

    )
}
	
