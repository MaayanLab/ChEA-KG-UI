import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import CardMedia from '@mui/material/CardMedia'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'

export const UseCase = ({title, description, src, image, launch, index}:
    {
        title: string,
        description: string,
        src: string,
        image: string,
        launch: string,
        index: number
    }) => {
        // return a single card
        return (
            <>
                <Card
                    sx={{ 
                        display: 'flex', 
                        flexDirection: 'column'
                      }}
                    key={index}>
                    <CardHeader
                        title={
                            <Typography variant="h4" align='center' sx={{ fontWeight: 'bold' }}>
                                {title}
                            </Typography>}
                    />
                    <CardMedia
                        component='img'
          
                        image={image}
                        alt={title}
                    />
                    <CardContent>
                        <Typography variant="body2" align = 'left' noWrap={false} sx={{paddingBottom:2}}>
                            {description}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'center'}}>
                            <Button 
                                href={src} 
                                key={title} 
                                size="large"
                                variant="contained"
                                color='primary'
                                target='_blank'
                                rel='noopener noreferrer'
                                sx={{
                                    alignContent: 'center',
                                    padding: "2px 10px 2px 10px",                                    
                                }}
                                > 
                                {launch} 
                                </Button>

                        </Box>
                        
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
            <Typography variant="h2" align='center' sx={{ fontWeight: 'bold' , paddingBottom:4}}>
                Appyter Workflows for Analyzing Gene Sets with ChEA-KG 
            </Typography>
            <Typography variant="body1" align='center' sx={{ paddingBottom:4}}>
                The ChEA-KG API has been extended to identify and analyze enriched regulatory subnetworks within two <a href="https://appyters.maayanlab.cloud/" target="_blank" rel="noopener noreferrer">Appyter</a> notebook workflows, which extend Jupyter notebooks to create functional standalone web-based applications. Read more about and try out each Appyter below.
            </Typography>
            <Grid container columnSpacing={2}>
            {usecaselib.map((el, i) => (
                <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
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
	
