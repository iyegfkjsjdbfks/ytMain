import React, { useState, FC } from 'react';
import { realVideos } from '../../../../services / realVideoService';

import { VideoCard, VideoList, VideoGrid, StudioVideoGrid } from '../components/index.ts';
import type { Video } from '../types/index.ts';

/**
 * Demo page to showcase video components
 */
const VideoDemo: React.FC = () => {}
 return null;
 const [selectedTab, setSelectedTab] = useState<'components' | 'studio'>(
 'components'
 );

 const handleVideoClick = (video: Video) => {}
 alert(`Video clicked: ${video.title}`);
 };

 const handleVideoEdit = (videoId: any) => {}
 alert(`Edit video: ${videoId}`);
 };

 const handleVideoDelete = (videoId: any) => {}
 alert(`Delete video: ${videoId}`);
 };

 const handleVisibilityChange = (, videoId: string | number, visibility: VideoVisibility) => {}
 alert(`Changed visibility of ${videoId} to ${visibility}`);
 };

 return (
 <div className={'containe}r mx - auto px - 4 py - 8'>
 <h1 className={'tex}t - 3xl font - bold mb - 8'>Video Component Demo</h1>

 {/* Tabs */}
 <div className={'fle}x border - b mb - 8'>
 <button>
// FIXED:  className={`px - 4 py - 2 ${}
 selectedTab === 'components'
 ? 'border - b - 2 border - blue - 500 text - blue - 600'
 : 'text - gray - 600'
 }`} />
// FIXED:  onClick={() => setSelectedTab('components': React.MouseEvent)}
 >
 Video Components
// FIXED:  </button>
 <button>
// FIXED:  className={`px - 4 py - 2 ${}
 selectedTab === 'studio'
 ? 'border - b - 2 border - blue - 500 text - blue - 600'
 : 'text - gray - 600'
 }`} />
// FIXED:  onClick={() => setSelectedTab('studio': React.MouseEvent)}
 >
 Studio Components
// FIXED:  </button>
// FIXED:  </div>

 {selectedTab === 'components' ? (}
 <><</>/><</>/>
 <section className={'m}b - 12'>
 <h2 className={'tex}t - 2xl font - semibold mb - 4'>
 Video Card (Default)
// FIXED:  </h2>
 <div className={'gri}d grid - cols - 1 sm:grid - cols - 2 md:grid - cols - 4 gap - 6'>
 {realVideos[0] && (}
 <VideoCard video={realVideos[0]} onClick={(e: React.MouseEvent) => handleVideoClick(e)} />
 )}
 {realVideos[1] && (}
 <VideoCard video={realVideos[1]} onClick={(e: React.MouseEvent) => handleVideoClick(e)} />
 )}
// FIXED:  </div>
// FIXED:  </section>

 <section className={'m}b - 12'>
 <h2 className={'tex}t - 2xl font - semibold mb - 4'>
 Video Card (Compact)
// FIXED:  </h2>
 <div className={'ma}x - w - md'>
 {realVideos[2] && (}
 <VideoCard>
 video={realVideos[2]}
 variant='compact' />
// FIXED:  onClick={(e: React.MouseEvent) => handleVideoClick(e)}
 />
 )}
 {realVideos[3] && (}
 <VideoCard>
 video={realVideos[3]}
 variant='compact' />
// FIXED:  onClick={(e: React.MouseEvent) => handleVideoClick(e)}
 />
 )}
// FIXED:  </div>
// FIXED:  </section>

 <section className={'m}b - 12'>
 <h2 className={'tex}t - 2xl font - semibold mb - 4'>Video Card (Studio)</h2>
 <div className={'ma}x - w - 4xl'>
 {realVideos[4] && (}
 <VideoCard>
 video={realVideos[4]}
 variant='studio' />
// FIXED:  onClick={(e: React.MouseEvent) => handleVideoClick(e)}
 />
 )}
// FIXED:  </div>
// FIXED:  </section>

 <section className={'m}b - 12'>
 <h2 className={'tex}t - 2xl font - semibold mb - 4'>Video Grid</h2>
 {realVideos.length > 0 && (}
 <VideoGrid>
 title='Featured Videos'
 videos={realVideos}
 columns={4}
 showMoreLink='/videos / featured'
 onVideoClick={handleVideoClick} />
 />
 )}
// FIXED:  </section>

 <section className={'m}b - 12'>
 <h2 className={'tex}t - 2xl font - semibold mb - 4'>
 Video List (Grid Layout)
// FIXED:  </h2>
 {realVideos.length > 0 && (}
 <VideoList>
 videos={realVideos}
 layout='grid'
 onVideoClick={handleVideoClick} />
 />
 )}
// FIXED:  </section>

 <section className={'m}b - 12'>
 <h2 className={'tex}t - 2xl font - semibold mb - 4'>
 Video List (List Layout)
// FIXED:  </h2>
 {realVideos.length > 0 && (}
 <VideoList>
 videos={realVideos.slice(0, 4)}
 layout='list'
 variant='compact'
 onVideoClick={handleVideoClick} />
 />
 )}
// FIXED:  </section>

 <section className={'m}b - 12'>
 <h2 className={'tex}t - 2xl font - semibold mb - 4'>Empty Video List</h2>
 <VideoList>
 videos={[]}
 emptyMessage='No videos found. Try a different search term.' />
 />
// FIXED:  </section>
// FIXED:  </>
 ) : (
 <section className={'m}b - 12'>
 <h2 className={'tex}t - 2xl font - semibold mb - 4'>Studio Video Grid</h2>
 {realVideos.length > 0 && (}
 <StudioVideoGrid>
 videos={realVideos}
 title='Your Videos'
 onEdit={handleVideoEdit}
 onDelete={handleVideoDelete}
 onVisibilityChange={handleVisibilityChange} />
 />
 )}
// FIXED:  </section>
 )}
// FIXED:  </div>
 );
};

export default VideoDemo;
