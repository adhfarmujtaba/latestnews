import Head from 'next/head';
import Image from 'next/image';
import { fetchPosts } from '../../lib/api';
import { useRouter } from 'next/router';
import { AiOutlineArrowLeft } from 'react-icons/ai';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const Post = ({ post }) => {
  const router = useRouter();
  const [showBackButton, setShowBackButton] = useState(true);
  const [loading, setLoading] = useState(true);
  const [skeletonVisible, setSkeletonVisible] = useState(true);
  const [cameDirectly, setCameDirectly] = useState(true); // New state to track direct access

  useEffect(() => {
    // Check if the user came directly to the page
    setCameDirectly(!document.referrer || !document.referrer.startsWith(window.location.origin));

    const handleScroll = () => {
      const currentScrollTop = window.pageYOffset;
      setShowBackButton(currentScrollTop < 100 || window.pageYOffset < 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (post) {
      const timeoutId = setTimeout(() => {
        setSkeletonVisible(false);
        setLoading(false);
      }, 400);

      return () => clearTimeout(timeoutId);
    }
  }, [post]);

  const date = post ? new Date(post.date) : new Date();
  const relativeDate = post ? formatDistanceToNow(date, { addSuffix: true }) : '';

  const getCurrentDomain = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'https://yourwebsite.com'; // Fallback for server-side rendering
  };

  const currentDomain = getCurrentDomain();
  const postUrl = post ? `${currentDomain}/posts/${post.slug}` : '';

  const defaultImage = `${currentDomain}/default-image.jpg`; // Replace with your default image URL
  const imageUrl = post && post.image ? post.image : defaultImage;

  const handleBackButtonClick = () => {
    if (cameDirectly) {
      router.push('/'); // Redirect to homepage if the user came directly to the page
    } else {
      router.back(); // Go back to the previous page
    }
  };

  return (
    <>
      <Head>
        <title>{post ? post.title : 'Post Not Found'}</title>
        <meta name="description" content={post ? post.excerpt : 'Post not found'} />
        <meta property="og:title" content={post ? post.title : 'Post Not Found'} />
        <meta property="og:description" content={post ? post.excerpt : 'Post not found'} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:url" content={postUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Your Website Name" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post ? post.title : 'Post Not Found'} />
        <meta name="twitter:description" content={post ? post.excerpt : 'Post not found'} />
        <meta name="twitter:image" content={imageUrl} />
        <meta name="twitter:url" content={postUrl} />
      </Head>

      <div className="bg-[#f8f9fa] min-h-screen">
        <div className="container mx-auto px-0">
          {loading && skeletonVisible ? (
            <article className="bg-white rounded-lg shadow-lg overflow-hidden">
              <Skeleton height={256} />
              <div className="p-6">
                <header className="mb-4">
                  <Skeleton width={300} height={36} />
                  <Skeleton width={150} height={20} className="mt-2" />
                </header>
                <section className="prose lg:prose-xl text-gray-700">
                  <Skeleton count={15} />
                </section>
              </div>
            </article>
          ) : !post ? (
            <p className="text-center text-red-500">Post not found</p>
          ) : (
            <article className="bg-white rounded-lg shadow-lg overflow-hidden">
              {post.image && (
                <div className="relative w-full h-64">
                  <Image
                    src={imageUrl}
                    alt={post.title}
                    layout="fill"
                    objectFit="cover"
                    className="absolute top-0 left-0"
                    priority
                  />
                </div>
              )}
              <div className="p-6">
                <header className="mb-4">
                  <h1 className="text-4xl font-bold text-gray-900">{post.title}</h1>
                  <p className="text-gray-600 text-sm mt-2">{relativeDate} • {post.read_time} min read</p>
                </header>
                <section
                  className="prose lg:prose-xl text-gray-700"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </div>
            </article>
          )}
          {showBackButton && (
            <button 
              onClick={handleBackButtonClick} 
              className="fixed top-4 left-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white p-3 rounded-full shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <AiOutlineArrowLeft size={24} />
            </button>
          )}
        </div>
      </div>
    </>
  );
};

// Optimize server-side data fetching
export async function getServerSideProps({ params }) {
  try {
    const post = await fetchPosts(params.slug);
    return { props: { post } };
  } catch (error) {
    console.error('Error fetching post:', error);
    return { props: { post: null } };
  }
}

export default Post;
