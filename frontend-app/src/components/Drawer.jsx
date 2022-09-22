import {useState} from "react";
import {
    Box,
    Button,
    Divider,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography
} from "@mui/material";

export default function InfoDrawer(props) {
    const [open, setOpen] = useState(false)
    const toggleDrawer = (open) => {
            setOpen(open);
        };

    const InfoDrawer = () => (
        <Box
            sx={'250'}
            width={"300px"}
            role="presentation"
            onClick={() => toggleDrawer(false)}
            onKeyDown={() => toggleDrawer(false)}
        >
            <Typography>
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
