import {useState} from "react";
import {
    Box,
    Button,
    Drawer,
    Typography
} from "@mui/material";
import "../styles/Drawer.scss"

export default function InfoDrawer(props) {
    const [open, setOpen] = useState(false)
    const toggleDrawer = (open) => {
            setOpen(open);
        };

    const InfoDrawer = () => (
        <Box
            className="drawer"
            sx={'250'}
            role="presentation"
            onClick={() => toggleDrawer(false)}
            onKeyDown={() => toggleDrawer(false)}
        >
            <Typography className="drawer__content">
                {props.info_text}
            </Typography>
        </Box>
    );

    return (
        <div>
            <Button onClick={() => toggleDrawer(true)}>What is a project type?</Button>
            <Drawer
            anchor={"right"}
            open={open}
            onClose={() => toggleDrawer(false)}
            >
                {InfoDrawer()}
            </Drawer>
        </div>
    )
}
