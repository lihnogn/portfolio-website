import React, { useState, useEffect } from 'react';
import type { Project } from '../types';
import { StarIcon } from './Icons';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const hasImageGallery = project.imageUrls && project.imageUrls.length > 1;

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    if (isHovered && hasImageGallery) {
      intervalId = setInterval(() => {
        setCurrentImageIndex(prevIndex => (prevIndex + 1) % project.imageUrls!.length);
      }, 1500);
    }
    return () => clearInterval(intervalId);
  }, [isHovered, hasImageGallery, project.imageUrls]);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setCurrentImageIndex(0);
  };

  return (
    <div 
      className="backdrop-blur-lg rounded-3xl shadow-lg transform transition-all duration-500 group overflow-hidden flex flex-col hover:scale-105 hover:-rotate-1 themed-project-card"
      style={{ backgroundColor: 'var(--bg-card)' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Media Section */}
      <div className="aspect-video relative overflow-hidden rounded-t-3xl" style={{ backgroundColor: 'var(--brand-color-light)'}}>
        {project.youtubeId ? (
          <iframe
            className="w-full h-full absolute inset-0"
            src={`https://www.youtube.com/embed/${project.youtubeId}`}
            title={project.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : (
          project.imageUrls?.map((url, index) => (
            <img 
              key={index}
              src={url} 
              alt={`${project.title} screenshot ${index + 1}`} 
              onError={(e) => { e.currentTarget.src = "/placeholder.png"; }}
              className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-700 ease-in-out ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))
        )}
      </div>

      {/* Content Section */}
      <div className="p-8 flex flex-col flex-grow">
        <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-main)' }}>{project.title}</h3>
        <p className="mb-6 flex-grow" style={{ color: 'var(--text-light)' }}>{project.description}</p>
        <div className="mt-auto">
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-semibold py-3 px-6 rounded-full shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 themed-button-action"
          >
            <StarIcon /> {project.buttonText}
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;