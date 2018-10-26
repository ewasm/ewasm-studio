import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Modal from '@material-ui/core/Modal';
import Button from '@material-ui/core/Button';

function rand() {
  return Math.round(Math.random() * 20) - 10;
}

function getModalStyle() {
  const top = 50 + rand();
  const left = 50 + rand();

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}
const styles = theme => ({
  paper: {
    position: 'absolute',
    width: theme.spacing.unit * 50,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 4,
  },
});

class SimpleModal extends React.Component {
  state = {
    open: false,
    txReceipt: null
  };

  handleOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  render() {
    const { classes } = this.props;

    let createdAddress, txStatus = null
    if (this.state.tx && this.state.tx.status) {
      txStatus = "Status: " + this.state.tx.status == "1" ? "success" : "failure"
    }
    if (this.state.tx && this.state.tx.contractAddress) {
      createdAddress = "Contract Address: " + this.state.tx.contractAddresss
    }

    return (
			<Modal
				aria-labelledby="simple-modal-title"
				aria-describedby="simple-modal-description"
				open={this.props.open}
				onClose={this.props.onClose}
			>
				<div style={getModalStyle()} className={classes.paper}>
					<Typography variant="subheading" id="simple-modal-description">
            <p> Tx Receipt: { this.props.txReceipt } </p>
					</Typography>
					<SimpleModalWrapped />
				</div>
			</Modal>
    );
  }
}

SimpleModal.propTypes = {
  classes: PropTypes.object.isRequired,
};

// We need an intermediary variable for handling the recursive nesting.
const SimpleModalWrapped = withStyles(styles)(SimpleModal);

export default SimpleModalWrapped;
