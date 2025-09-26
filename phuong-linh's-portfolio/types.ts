
export interface Project {
  title: string;
  description: string;
  buttonText: string;
  link: string;
  imageUrls?: string[];
  youtubeId?: string;
}

export interface TimelineEvent {
    date: string;
    title: string;
    description:string;
    icon?: React.ReactNode;
}