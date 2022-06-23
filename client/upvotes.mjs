const e = React.createElement;

export const createComponent = (element, post, user, posts) => {
  
  class UpvoteComponent extends React.Component {
    constructor(props) {
      super(props);
      
      this.state = {
        user,
        post,
        color: props.color,
        loading: false,
      }
    }

    render() {
      return e(
        'button',
        {
          key: this.state.post.id,
          onClick: async () => {
            if (this.state.post.authorId === this.state.user.id) return;

            this.setState({
              loading: true,
            })

            await posts.upvotePost({
              authorId: this.state.post.authorId,
              postId: this.state.post.id,
              upvoterId: this.state.user.id
            });

            this.setState({
              loading: false
            })
          },
          className: this.state.loading ? 'text-gray-300' : this.state.color,
        },
        '^ Upvote'
      )
    }
  }

  const root = ReactDOM.createRoot(element);

  root.render(
    e(UpvoteComponent, {
      postId: post.id,
      color: user.upvotes.some(upvote => upvote.postId === post.id)
        ? 'text-purple-500'
        : 'text-black'
    })
  );
}