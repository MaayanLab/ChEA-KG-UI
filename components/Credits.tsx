import { Grid, Link, Typography, List, ListItem } from "@mui/material";

const Credits = () => (
	<Grid container spacing={1}>
		<Grid item xs={12}>
			<Typography variant="h3">Credits</Typography>
			
		</Grid>
		<Grid item xs={12}>
		<Typography variant="body1">Icons are provided by <Link href="https://www.flaticon.com" color={"secondary"} target="_blank" rel="noopener noreferrer">Flaticon</Link></Typography>
		<List>
			<ListItem>
				<Link color="secondary" href="https://www.flaticon.com/free-icons/liver" title="liver icons">Liver icons created by Freepik - Flaticon</Link>
			</ListItem>
			<ListItem>
				<Link color="secondary" href="https://www.flaticon.com/free-icons/heart" title="heart icons">Heart icons created by Smashicons - Flaticon</Link>
			</ListItem>
			<ListItem>
				<Link color="secondary" href="https://www.flaticon.com/free-icons/kidney" title="kidney icons">Kidney icons created by DailyPm Studio - Flaticon</Link>
			</ListItem>
			<ListItem>
				<Link color="secondary" href="https://www.flaticon.com/free-icons/skin" title="skin icons">Skin icons created by Freepik - Flaticon</Link>
			</ListItem>
			<ListItem>
				<Link color="secondary" href="https://www.flaticon.com/free-icons/bone" title="bone icons">Bone icons created by Freepik - Flaticon</Link>
			</ListItem>
			<ListItem>
				<Link color="secondary" href="https://www.flaticon.com/free-icons/pancreas" title="pancreas icons">Pancreas icons created by Freepik - Flaticon</Link>
			</ListItem>
			<ListItem>
				<Link color="secondary" href="https://www.flaticon.com/free-icons/blood" title="blood icons">Blood icons created by Nadiinko - Flaticon</Link>
			</ListItem>
			<ListItem>
				<Link color="secondary" href="https://www.flaticon.com/free-icons/brain" title="brain icons">Brain icons created by Freepik - Flaticon</Link>
			</ListItem>
			<ListItem>
				<Link color="secondary" href="https://www.flaticon.com/free-icons/healthcare-and-medical" title="healthcare and medical icons">Healthcare and medical icons created by Smashicons - Flaticon</Link>
			</ListItem>
			<ListItem>
				<Link color="secondary" href="https://www.flaticon.com/free-icons/uterus" title="uterus icons">Uterus icons created by Freepik - Flaticon</Link>
			</ListItem>
			<ListItem>
				<Link color="secondary"  href="https://www.flaticon.com/free-icons/bone-marrow" title="bone marrow icons">Bone marrow icons created by Iconjam - Flaticon</Link>
			</ListItem>
			<ListItem>
				<Link color="secondary" href="https://www.flaticon.com/free-icons/eye" title="eye icons">Eye icons created by max.icons - Flaticon</Link>
			</ListItem>
			<ListItem>
				<Link color="secondary" href="https://www.flaticon.com/free-icons/lungs" title="lungs icons">Lungs icons created by Freepik - Flaticon</Link>
			</ListItem>
			<ListItem>
				<Link color="secondary" href="https://www.flaticon.com/free-icons/intestine" title="intestine icons">Intestine icons created by Freepik - Flaticon</Link>
			</ListItem>
		</List>
		</Grid>
	</Grid>
)

export default Credits