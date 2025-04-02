"use client"
import { Calendar, Home, Inbox, Search, Settings } from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useEffect, useState } from "react"
import axios from "axios"

// Menu items.
const items = [
    {
        title: "Home",
        url: "#",
        icon: Home,
    },
    {
        title: "Inbox",
        url: "#",
        icon: Inbox,
    },
    {
        title: "Calendar",
        url: "#",
        icon: Calendar,
    },
    {
        title: "Search",
        url: "#",
        icon: Search,
    },
    {
        title: "Settings",
        url: "#",
        icon: Settings,
    },
]

export function AppSidebar() {
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await axios({
                    method: "GET",
                    url: "/api/projects",
                    params: {
                        userId: "cm8zhuaew0000356phofi235d"
                    }
                })
                setProjects(response?.data?.data);
            } catch (error) {
                console.error("Error fetching projects:", error);
            }
        };

        fetchProjects();
    }, []);
    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="text-lg font-bold">My Projects</SidebarGroupLabel>
                    <SidebarGroupContent className="mt-2">
                        <SidebarMenu>
                            {projects.map((item: any) => (
                                <SidebarMenuItem key={item?.id}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url}>
                                            <span>{item.name}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <div className="flex pb-20 justify-center p-6">
                <button className="bg-red-600 px-8 py-1 rounded-2xl cursor-pointer"> Logout</button>
            </div>
        </Sidebar>
    )
}
