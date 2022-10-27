import {useState} from "react";
import {
    Box,
    Button,
    Drawer,
    Typography
} from "@mui/material";
import "../styles/Drawer.scss"
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

export default function InfoDrawer(props) {
    const [open, setOpen] = useState(false)
    const toggleDrawer = (open) => {
            setOpen(open);
        };

    const InfoText =
            <pre className={"pre"}>
                {props.info_text}
                {/*{props?.info_text.replace( "\n", "<br/>")*/}
                {/*}*/}
            </pre>


    const InfoDrawer = () => (
        <Box
            className="drawer"
            sx={'250'}
            role="presentation"
            onClick={() => toggleDrawer(false)}
            onKeyDown={() => toggleDrawer(false)}
        >
            <Typography className={"drawer__content"} variant={"h4"}>
                {props.title}
            </Typography>
            {InfoText}
        </Box>
    );

    return (
        <div>
            <HelpOutlineIcon className={"drawer__button"} style={{"cursor":"pointer"}} onClick={() => toggleDrawer(true)}/>
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
